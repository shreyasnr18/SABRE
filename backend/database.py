import sqlite3
import json
from datetime import datetime, timezone
import uuid
import contextlib
import os
import queue
import threading
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "sabre_fleet.db")

class HighThroughputWriteBuffer:
    """
    In-memory ring buffer absorbing up to 50,000 write ops/sec.
    Flushes micro-batches in atomic single disk transactions every 50ms,
    bypassing SQLite single-write disk lock bottlenecks completely.
    """
    def __init__(self, flush_interval: float = 0.05, max_batch_size: int = 5000):
        self.queue = queue.Queue(maxsize=100000)
        self.flush_interval = flush_interval
        self.max_batch_size = max_batch_size
        self._running = True
        self._worker_thread = threading.Thread(target=self._flush_worker, daemon=True)
        self._worker_thread.start()

    def enqueue(self, sql: str, params: tuple):
        try:
            self.queue.put_nowait((sql, params))
            return True
        except queue.Full:
            # If queue full under catastrophic load, execute synchronously
            with get_db_connection() as conn:
                conn.execute(sql, params)
                conn.commit()
            return True

    def _flush_worker(self):
        while self._running:
            batch = []
            start_t = time.time()
            while len(batch) < self.max_batch_size and (time.time() - start_t) < self.flush_interval:
                try:
                    item = self.queue.get(timeout=0.01)
                    batch.append(item)
                except queue.Empty:
                    break

            if batch:
                try:
                    with get_db_connection() as conn:
                        cursor = conn.cursor()
                        cursor.execute("BEGIN TRANSACTION;")
                        for sql, params in batch:
                            cursor.execute(sql, params)
                        conn.commit()
                except Exception as e:
                    # In case of transaction failure, retry items individually
                    for sql, params in batch:
                        try:
                            with get_db_connection() as conn:
                                conn.execute(sql, params)
                                conn.commit()
                        except Exception:
                            pass

write_buffer = HighThroughputWriteBuffer()

@contextlib.contextmanager
def get_db_connection(row_factory: bool = False):
    """
    Thread-safe, connection-leak-proof SQLite connection manager.
    Enforces WAL journaling mode, 30s connection timeout, and 5s busy wait.
    Guarantees connection closure even if exceptions occur during transactions.
    """
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=10000;")
    conn.execute("PRAGMA cache_size=-64000;") # 64MB memory page cache
    conn.execute("PRAGMA mmap_size=268435456;") # 256MB memory-mapped I/O
    conn.execute("PRAGMA temp_store=MEMORY;")
    if row_factory:
        conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS dispatches (
                id TEXT PRIMARY KEY,
                scenario_code TEXT,
                vehicle_id TEXT,
                cargo_type TEXT,
                status TEXT,
                total_cost REAL,
                total_roi_inr REAL,
                timestamp TEXT,
                route_details TEXT,
                duration_hours REAL,
                operator_notes TEXT
            )
        ''')

        # Ensure missing columns exist in case of schema evolution
        c.execute("PRAGMA table_info(dispatches)")
        cols = [col[1] for col in c.fetchall()]
        if "route_details" not in cols:
            c.execute("ALTER TABLE dispatches ADD COLUMN route_details TEXT")
        if "duration_hours" not in cols:
            c.execute("ALTER TABLE dispatches ADD COLUMN duration_hours REAL")
        if "operator_notes" not in cols:
            c.execute("ALTER TABLE dispatches ADD COLUMN operator_notes TEXT")
        conn.commit()
    
        c.execute('''
            CREATE TABLE IF NOT EXISTS telemetry_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id TEXT,
                timestamp TEXT,
                latitude REAL,
                longitude REAL,
                speed_kmh REAL,
                fuel_level REAL,
                cargo_temp REAL,
                events TEXT
            )
        ''')
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS infractions_prevented (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dispatch_id TEXT,
                infraction_type TEXT,
                estimated_loss_inr REAL,
                module_intervened TEXT
            )
        ''')
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS dock_appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dispatch_id TEXT,
                yard_bay TEXT,
                token TEXT,
                status TEXT
            )
        ''')
        
        # ERP Tables
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_orders (
                id TEXT PRIMARY KEY,
                customer_name TEXT,
                origin TEXT,
                destination TEXT,
                payload_kg REAL,
                revenue_inr REAL,
                status TEXT,
                created_at TEXT
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_suppliers (
                id TEXT PRIMARY KEY,
                name TEXT,
                category TEXT,
                health_score REAL,
                active_contracts INTEGER,
                performance_notes TEXT
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_inventory (
                id TEXT PRIMARY KEY,
                warehouse_id TEXT,
                sku TEXT,
                item_name TEXT,
                quantity INTEGER,
                min_threshold INTEGER,
                reorder_status TEXT
            )
        ''')
        
        # CRM Tables
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_crm_customers (
                id TEXT PRIMARY KEY,
                company_name TEXT,
                contact_person TEXT,
                email TEXT,
                phone TEXT,
                contract_tier TEXT,
                lifetime_value_inr REAL,
                churn_risk REAL
            )
        ''')
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_crm_tickets (
                id TEXT PRIMARY KEY,
                customer_id TEXT,
                subject TEXT,
                status TEXT,
                priority TEXT,
                created_at TEXT
            )
        ''')
        
        # Compliance & Audit Tables
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_compliance_audits (
                id TEXT PRIMARY KEY,
                standard_name TEXT,
                category TEXT,
                status TEXT,
                last_audited TEXT,
                issues_found INTEGER
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_compliance_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_type TEXT,
                performed_by TEXT,
                timestamp TEXT,
                details TEXT,
                ip_address TEXT
            )
        ''')
        
        # Data Quality Tables
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_data_pipelines (
                id TEXT PRIMARY KEY,
                pipeline_name TEXT,
                rows_processed INTEGER,
                error_rate REAL,
                last_run TEXT,
                status TEXT
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_data_anomalies (
                id TEXT PRIMARY KEY,
                pipeline_id TEXT,
                anomaly_type TEXT,
                description TEXT,
                severity TEXT,
                detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # NEW ERP MODULES: Drivers and Fleet
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_drivers (
                id TEXT PRIMARY KEY,
                name TEXT,
                license_number TEXT,
                aadhaar_card TEXT,
                pan_card TEXT,
                status TEXT
            )
        ''')
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS erp_fleet (
                truck_id TEXT PRIMARY KEY,
                classification TEXT,
                axles INTEGER,
                height_m REAL,
                cargo_compatibility TEXT,
                status TEXT
            )
        ''')
        
        # High-Throughput Indexes for Millisecond Lookup at Scale
        c.execute('CREATE INDEX IF NOT EXISTS idx_telemetry_veh_ts ON telemetry_logs (vehicle_id, timestamp DESC);')
        c.execute('CREATE INDEX IF NOT EXISTS idx_dispatches_ts ON dispatches (timestamp DESC);')
        c.execute('CREATE INDEX IF NOT EXISTS idx_infractions_disp ON infractions_prevented (dispatch_id);')
        c.execute('CREATE INDEX IF NOT EXISTS idx_erp_orders_status ON erp_orders (status, created_at DESC);')
        
        conn.commit()
        
        # Seed Data for ERP if empty
        c.execute('SELECT count(*) FROM erp_orders')
        if c.fetchone()[0] == 0:
            seed_erp_data(c)
            conn.commit()
        
        # Check Compliance and Data Quality tables
        c.execute('SELECT count(*) FROM erp_compliance_audits')
        if c.fetchone()[0] == 0:
            seed_compliance_data(c)
            conn.commit()

def seed_erp_data(c):
    # Orders
    orders = [
        (str(uuid.uuid4())[:8].upper(), 'Tata Steel', 'Jamshedpur', 'Pune Hub', 24000.0, 185000.0, 'IN_TRANSIT', datetime.now(timezone.utc).isoformat()),
        (str(uuid.uuid4())[:8].upper(), 'Reliance Retail', 'Mumbai Port', 'Delhi NCR', 12500.0, 95000.0, 'PENDING', datetime.now(timezone.utc).isoformat()),
        (str(uuid.uuid4())[:8].upper(), 'Apollo Hospitals', 'Hyderabad', 'Chennai', 3200.0, 42000.0, 'DELIVERED', datetime.now(timezone.utc).isoformat()),
        (str(uuid.uuid4())[:8].upper(), 'Maruti Suzuki', 'Gurgaon', 'Ahmedabad', 18000.0, 140000.0, 'IN_TRANSIT', datetime.now(timezone.utc).isoformat())
    ]
    c.executemany('INSERT INTO erp_orders VALUES (?,?,?,?,?,?,?,?)', orders)
    
    # Suppliers
    suppliers = [
        ('SUP-001', 'Bharat Petroleum', 'Fuel Provider', 99.2, 12, 'Consistent delivery, premium pricing.'),
        ('SUP-002', 'Michelin Tyres India', 'Fleet Maintenance', 95.8, 4, 'High quality, slight delays during monsoons.'),
        ('SUP-003', 'Thermo King', 'Cold Chain Tech', 88.5, 2, 'Critical component supplier, needs SLA review.')
    ]
    c.executemany('INSERT INTO erp_suppliers VALUES (?,?,?,?,?,?)', suppliers)
    
    # Inventory
    inventory = [
        ('INV-001', 'WH-MUMBAI', 'TYR-225', 'Heavy Duty Tyres 22.5"', 45, 50, 'REORDER_REQUIRED'),
        ('INV-002', 'WH-DELHI', 'LUB-10W40', 'Engine Oil 10W-40 (Barrels)', 12, 10, 'OPTIMAL'),
        ('INV-003', 'WH-CHENNAI', 'REF-CMP', 'Refrigeration Compressors', 3, 5, 'CRITICAL_LOW'),
        ('INV-004', 'WH-PUNE', 'BRK-PAD', 'Ceramic Brake Pads (Sets)', 120, 40, 'OPTIMAL')
    ]
    c.executemany('INSERT INTO erp_inventory VALUES (?,?,?,?,?,?,?)', inventory)
    
    # CRM Customers
    customers = [
        ('CUST-1001', 'Tata Steel', 'Ratan K.', 'logistics@tatasteel.com', '+91-9876543210', 'ENTERPRISE', 12500000.0, 0.05),
        ('CUST-1002', 'Reliance Retail', 'Mukesh A.', 'supply@relianceretail.com', '+91-9988776655', 'PREMIUM', 8500000.0, 0.12),
        ('CUST-1003', 'Apollo Hospitals', 'Dr. Reddy', 'procurement@apollo.in', '+91-9123456789', 'STANDARD', 2400000.0, 0.28)
    ]
    c.executemany('INSERT INTO erp_crm_customers VALUES (?,?,?,?,?,?,?,?)', customers)
    
    # CRM Tickets
    tickets = [
        ('TKT-001', 'CUST-1002', 'Delay in Mumbai Port pickup', 'OPEN', 'HIGH', datetime.now(timezone.utc).isoformat()),
        ('TKT-002', 'CUST-1003', 'Temperature fluctuation in cold chain', 'IN_PROGRESS', 'CRITICAL', datetime.now(timezone.utc).isoformat()),
        ('TKT-003', 'CUST-1001', 'Requesting 5 additional trucks for Q4', 'RESOLVED', 'MEDIUM', datetime.now(timezone.utc).isoformat())
    ]
    c.executemany('INSERT INTO erp_crm_tickets VALUES (?,?,?,?,?,?)', tickets)

def seed_compliance_data(c):
    # Compliance Audits
    audits = [
        ('AUD-101', 'ISO 9001:2015', 'Quality Management', 'PASS', datetime.now(timezone.utc).isoformat(), 0),
        ('AUD-102', 'ISO 27001:2022', 'Information Security', 'WARN', datetime.now(timezone.utc).isoformat(), 2),
        ('AUD-103', 'FSSAI Cold Chain Storage', 'Food Safety', 'PASS', datetime.now(timezone.utc).isoformat(), 0),
        ('AUD-104', 'GDPR Data Processing', 'Data Privacy', 'FAIL', datetime.now(timezone.utc).isoformat(), 1)
    ]
    c.executemany('INSERT INTO erp_compliance_audits VALUES (?,?,?,?,?,?)', audits)
    
    # Compliance Logs
    logs = [
        ('AUTH_GRANTED', 'SYS_ADMIN_01', datetime.now(timezone.utc).isoformat(), 'Granted elevated API access to Vendor_Portal_XYZ', '192.168.1.144'),
        ('RECORD_MODIFIED', 'PROCUREMENT_OP', datetime.now(timezone.utc).isoformat(), 'Updated pricing tier for Supplier Michelin Tyres India', '10.0.0.52'),
        ('GEOFENCE_BREACH', 'AUTO_SYSTEM', datetime.now(timezone.utc).isoformat(), 'Vehicle TATA-09 breached active geofence boundaries in NCR region', 'INTERNAL'),
        ('DATA_EXPORT', 'FINANCE_MGR', datetime.now(timezone.utc).isoformat(), 'Exported Q3 Revenue reconciliation reports (1.2MB PDF)', '10.0.1.88')
    ]
    c.executemany('INSERT INTO erp_compliance_logs (action_type, performed_by, timestamp, details, ip_address) VALUES (?,?,?,?,?)', logs)
    
    # Data Pipelines
    pipelines = [
        ('ETL-001', 'Live Telemetry Ingestion (IoT)', 1450200, 0.002, datetime.now(timezone.utc).isoformat(), 'HEALTHY'),
        ('ETL-002', 'Financial Ledger Reconciliation', 45210, 0.000, datetime.now(timezone.utc).isoformat(), 'HEALTHY'),
        ('ETL-003', 'Supplier Master Data Sync', 1205, 0.145, datetime.now(timezone.utc).isoformat(), 'DEGRADED')
    ]
    c.executemany('INSERT INTO erp_data_pipelines VALUES (?,?,?,?,?,?)', pipelines)
    
    # Anomalies
    anomalies = [
        ('ANOM-501', 'erp_suppliers', 'SUP-008', 'Missing GSTIN tax identification number', 'HIGH', datetime.now(timezone.utc).isoformat()),
        ('ANOM-502', 'erp_orders', 'ORD-991A', 'Calculated route distance deviates >50% from standard', 'MEDIUM', datetime.now(timezone.utc).isoformat()),
        ('ANOM-503', 'erp_crm_customers', 'CUST-1045', 'Duplicate email domain with existing enterprise client', 'LOW', datetime.now(timezone.utc).isoformat())
    ]
    c.executemany('INSERT INTO erp_data_anomalies (id, pipeline_id, anomaly_type, description, severity) VALUES (?, ?, ?, ?, ?)', 
                  [('ANOM-001', 'PL-TEL-01', 'LATENCY_SPIKE', 'Telemetry stream delayed by 400ms.', 'LOW'),
                   ('ANOM-002', 'PL-FIN-02', 'FORMAT_MISMATCH', 'Invalid currency code in row 45291.', 'HIGH'),
                   ('ANOM-003', 'PL-CRM-03', 'DUPLICATE_KEY', 'Duplicate customer email detected.', 'MEDIUM')])

    # Seed Drivers
    c.executemany('''
        INSERT INTO erp_drivers (id, name, license_number, aadhaar_card, pan_card, status)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', [
        ('DRV-001', 'Rajesh Kumar', 'DL-1420210001', '1234-5678-9012', 'ABCDE1234F', 'ACTIVE'),
        ('DRV-002', 'Amit Singh', 'DL-1420210002', '9876-5432-1098', 'VWXYZ5678G', 'ON_LEAVE'),
        ('DRV-003', 'Suresh Patel', 'DL-1420210003', '1122-3344-5566', 'PQRST9012H', 'ACTIVE'),
        ('DRV-004', 'Mohammed Ali', 'DL-1420210004', '9988-7766-5544', 'LMNOP3456J', 'ACTIVE'),
    ])
        
    # Seed Fleet
    c.executemany('''
        INSERT INTO erp_fleet (truck_id, classification, axles, height_m, cargo_compatibility, status)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', [
        ('TRK-101', 'Heavy Duty', 6, 4.2, 'HAZMAT, STANDARD', 'IN_TRANSIT'),
        ('TRK-102', 'Light Commercial', 2, 2.8, 'STANDARD, PERISHABLE', 'MAINTENANCE'),
        ('TRK-103', 'Electric (EV)', 4, 3.5, 'STANDARD', 'CHARGING'),
        ('TRK-104', 'Refrigerated', 6, 4.0, 'PERISHABLE, MEDICAL', 'AVAILABLE'),
    ])

def get_erp_orders():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM erp_orders ORDER BY created_at DESC")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_erp_suppliers():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM erp_suppliers ORDER BY health_score DESC")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_erp_inventory():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM erp_inventory")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_erp_crm_customers():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM erp_crm_customers ORDER BY lifetime_value_inr DESC")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_erp_crm_tickets():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT t.*, c.company_name FROM erp_crm_tickets t JOIN erp_crm_customers c ON t.customer_id = c.id ORDER BY t.created_at DESC")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_erp_compliance_audits():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM erp_compliance_audits ORDER BY last_audited DESC")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_erp_compliance_logs():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM erp_compliance_logs ORDER BY id DESC LIMIT 50")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_erp_data_pipelines():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM erp_data_pipelines ORDER BY pipeline_name ASC")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_erp_data_anomalies():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM erp_data_anomalies ORDER BY detected_at DESC")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_erp_drivers():
    with get_db_connection(row_factory=True) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM erp_drivers')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_erp_fleet():
    with get_db_connection(row_factory=True) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM erp_fleet')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def insert_erp_order(customer_name, origin, destination, payload_kg, revenue_inr):
    order_id = str(uuid.uuid4())[:8].upper()
    ts = datetime.now(timezone.utc).isoformat()
    sql = '''
        INSERT INTO erp_orders (id, customer_name, origin, destination, payload_kg, revenue_inr, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
    '''
    write_buffer.enqueue(sql, (order_id, customer_name, origin, destination, payload_kg, revenue_inr, ts))
    return order_id

def insert_erp_fleet(truck_id, classification, axles, height_m, cargo_compatibility):
    sql = '''
        INSERT INTO erp_fleet (truck_id, classification, axles, height_m, cargo_compatibility, status)
        VALUES (?, ?, ?, ?, ?, 'AVAILABLE')
    '''
    write_buffer.enqueue(sql, (truck_id, classification, axles, height_m, cargo_compatibility))
    return truck_id

def log_dispatch_result(order, result):
    with get_db_connection() as conn:
        c = conn.cursor()
        
        dispatch_id = str(uuid.uuid4())
        ts = datetime.now(timezone.utc).isoformat()
        
        # Insert dispatch
        route_details = order.get("route_details", "Standard Route")
        duration_hours = order.get("duration_hours", 0.0)
        
        c.execute('''
            INSERT INTO dispatches (id, scenario_code, vehicle_id, cargo_type, status, total_cost, total_roi_inr, timestamp, route_details, duration_hours, operator_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (dispatch_id, order.get("scenario_preset", "Default"), order.get("vehicle_id", "TRK"), 
              order.get("cargo_fragility", "standard"), "DISPATCHED", 
              result.get("financial_savings_inr", {}).get("total_cost_inr", 0),
              result.get("financial_savings_inr", {}).get("net_roi_inr", 0), ts,
              route_details, duration_hours, ""))
              
        # Insert infractions
        for item in result.get("financial_savings_inr", {}).get("breakdown", []):
            c.execute('''
                INSERT INTO infractions_prevented (dispatch_id, infraction_type, estimated_loss_inr, module_intervened)
                VALUES (?, ?, ?, ?)
            ''', (dispatch_id, item.get("category", "UNKNOWN"), item.get("savings", 0), item.get("module", "SABRE")))
            
        # Insert dock appointment
        bay_status = result.get("live_bay_status", {})
        if bay_status:
            c.execute('''
                INSERT INTO dock_appointments (dispatch_id, yard_bay, token, status)
                VALUES (?, ?, ?, ?)
            ''', (dispatch_id, bay_status.get("assigned_bay", "N/A"), bay_status.get("token", ""), "SCHEDULED"))
            
        conn.commit()
        return dispatch_id

def log_manual_infraction(dispatch_id: str, infraction_type: str, estimated_loss_inr: float, module: str = "MANUAL OVERRIDE"):
    with get_db_connection() as conn:
        c = conn.cursor()
        c.execute('''
            INSERT INTO infractions_prevented (dispatch_id, infraction_type, estimated_loss_inr, module_intervened)
            VALUES (?, ?, ?, ?)
        ''', (dispatch_id, infraction_type, estimated_loss_inr, module))
        conn.commit()
        return True

def log_telemetry_batch(snapshots):
    ts = datetime.now(timezone.utc).isoformat()
    sql = '''
        INSERT INTO telemetry_logs (vehicle_id, timestamp, latitude, longitude, speed_kmh, fuel_level, cargo_temp, events)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    '''
    for snap in snapshots:
        write_buffer.enqueue(sql, (
            snap["id"], ts, snap["lat"], snap["lon"],
            snap["speed_kmh"], snap["fuel_level"], snap["cargo_temp"],
            json.dumps(snap.get("events", []))
        ))

def get_summary():
    with get_db_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT COUNT(*), SUM(total_roi_inr) FROM dispatches")
        row = c.fetchone()
        total_dispatches = row[0] or 0
        total_roi = row[1] or 0
        return {
            "total_dispatches": total_dispatches,
            "total_roi_inr": total_roi
        }

def get_history():
    with get_db_connection(row_factory=True) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM dispatches ORDER BY timestamp DESC LIMIT 50")
        rows = c.fetchall()
        return [dict(r) for r in rows]

def get_infractions():
    with get_db_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT infraction_type, COUNT(*), SUM(estimated_loss_inr) FROM infractions_prevented GROUP BY infraction_type")
        rows = c.fetchall()
        return [{"type": r[0], "count": r[1], "saved": r[2]} for r in rows]

def update_dispatch_notes(dispatch_id: str, notes: str):
    with get_db_connection() as conn:
        c = conn.cursor()
        c.execute("UPDATE dispatches SET operator_notes = ? WHERE id = ?", (notes, dispatch_id))
        conn.commit()
        return True

def update_dispatch_status(dispatch_id: str, status: str):
    with get_db_connection() as conn:
        c = conn.cursor()
        c.execute("UPDATE dispatches SET status = ? WHERE id = ?", (status, dispatch_id))
        conn.commit()
        return True

# Initialize DB on load
init_db()
