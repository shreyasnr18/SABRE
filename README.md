# SABRE: Spatial Autonomous Blueprint for Route Optimization and Freight Execution

SABRE is an enterprise-grade autonomous operating system and financial clearing platform engineered specifically for commercial heavy transport, multi-axle freight logistics, and inter-state supply chains in India. 

Unlike conventional fleet tracking tools that treat commercial multi-axle tractor-trailers like passenger vehicles, SABRE integrates continuous physical cost equations (swept-path clearance, rotor thermal accumulation on mountain descents, road roughness indexing, and monsoon wading limits) with the digital infrastructure mandated by the National Logistics Policy (Unified Logistics Interface Platform / ULIP, VAHAN, SARATHI, GST E-Way Bill, FASTag, and TReDS).

---

## Key Pillars of the System

### 1. Indian Transport Operational and Financial Lifecycle
SABRE executes the strict 7-to-8 stage documented paper and capital chain required by Goods Transport Agencies (GTA) and industrial shippers across India:

```
[ 1. INDENT & ULIP COMPLIANCE (VAHAN / SARATHI) ]
                        |
[ 2. LOADING & 4-COPY BILTY GENERATION (GTA SAC 9965) ]
                        |
[ 3. TRIP SHEET & 70% ADVANCE OUTFLOW (HISAAB & 15G/H) ]
                        |
[ 4. IN-TRANSIT FASTag API & E-WAY BILL CLOCK ]
                        |
[ 5. UNLOADING WEIGHBRIDGE & PHYSICAL STAMPED POD ]
                        |
[ 6. PHYSICAL BILL SUBMISSION & ACKNOWLEDGMENT CLOCK ]
                        |
[ 7. DEBIT RECONCILIATION & MSME TReDS DISCOUNTING ]
                        |
[ 8. WORKFORCE KHATA LEDGER & STANDALONE TRUCK P&L ]
```

* Stage 1: Indent Booking and Instant ULIP Compliance
  * VAHAN API: Automated real-time verification of Vehicle Registration Certificate (RC), Fitness Certificate validity, National Permit (NP Class), and State Road Tax currency.
  * SARATHI API: Commercial Driving License (DL) authentication and Central Motor Vehicles Rules (CMVR) Rule 137 Hazardous Goods endorsement check.
* Stage 2: Loading and The 4-Copy Bilty (Lorry Receipt / LR)
  * Generates all four statutory copies mandated under GTA rules (SAC Code 9965):
    1. Consignor Copy: Surrendered to shipper security for gate-pass issuance and inventory reduction.
    2. Consignee Copy: Handed to buyer warehouse upon final destination delivery and GRN generation.
    3. Driver Copy: Carried in vehicle cabin for highway RTO and enforcement inspections.
    4. Transporter Copy: Returned to commercial accounts with original POD attached to raise tax invoices.
* Stage 3: Trip Sheet and Driver Advance Outflow (Hisaab)
  * Calculates and disburses the 70% operational advance across three strict channels:
    * Physical Cash / Daily Bata: Road allowance, en-route food, weighbridge token fees, and emergency puncture repairs.
    * Corporate Fleet Fuel Card: RFID-authorized dispensing via IndianOil XTRAPOWER or BPCL SmartFleet networks.
    * FASTag Electronic Wallet: Automated direct recharge on the NHAI tag balance.
  * Market Broker Truck Memo: Logs broker hire rates, advances, and mandatory Form 15G / 15H statutory declarations to exempt TDS deductions under Section 194C(6) of the Income Tax Act.
* Stage 4: In-Transit FASTag Telemetry and E-Way Bill Clock
  * Synchronizes electronic toll deductions directly from bank statements, eliminating the need for drivers to retain highway toll slips.
  * E-Way Bill Expiry Countdown: Calculates distance-to-destination against validity hours to eliminate Section 129 GST seizure notices (mandatory 200% tax penalty) with integrated Part-B extension workflows.
* Stage 5: Destination Unloading and Physical Stamped POD
  * Integrates destination weighbridge slips (Gross, Tare, Net weights).
  * Clean Sound POD vs Shortage / Damage Remark Engine: Flags cargo defects, calculates monetary damage debits, and initiates client dispute notices.
* Stage 6: Bill Submission and The Acknowledgment Clock
  * Monitors the physical transit of the original paper Bilty across three stages: Driver Cabin -> Regional Branch -> Client Accounts Desk.
  * Acknowledgment Date Tracking: Enforces the industry reality that client 30/45-day payment credit terms begin strictly from the date the client accounts desk physically stamps the acknowledged invoice and original Bilty.
* Stage 7: Final Settlement and MSME TReDS Invoice Discounting
  * Final Settlement Equation:
    Agreed Freight - TDS (Sec 194C) - Damage Debit - Late Unloading Penalty - Advance Paid = Net Bank Credit
  * Trade Receivables Discounting System (TReDS) Integration: Connects approved corporate invoices with participating factoring banks (SBI, HDFC, Bank of Baroda) across RXIL, Invoicemart, and M1xchange for 80% to 90% instant liquidity disbursement within 24 hours.
* Stage 8: Internal Crew Khata and Standalone Vehicle P&L
  * Workforce Khata Ledger: Reconciles monthly base salaries, trip bata, trip advances, and emergency personal loans across drivers, cleaners, and dispatchers with IMPS/NEFT disbursement tracking.
  * Standalone Vehicle P&L: Tracks freight revenues against fuel, FASTag tolls, crew wages, tyre wear, and monthly commercial bank vehicle loans (Tata Motors Finance, HDFC Bank, Sundaram Finance) to monitor debt-service coverage ratios (DSCR).

---

### 2. Spatial Physics Routing Engine
SABRE replaces standard road navigation algorithms with a 14-parameter heavy vehicle constraint solver:
* Dynamic Swept-Path Validator: Evaluates curb-to-curb turning radii for long-wheelbase semi-trailers (up to 24 meters) at sharp highway intersections.
* Rotor Thermal and Gradient Indexer: Computes brake disc temperature accumulation on continuous ghat descents (such as NH-75 Shiradi Ghat or Kasara Ghat), prescribing mandatory thermal rest stops.
* International Roughness Index (IRI) Penalizer: Prevents mechanical suspension damage and high-value cargo shock by dynamically penalizing corrugated or degraded road sectors.
* Monsoon Wading Threshold Engine: Cross-references live flood sensor telemetry with truck air-intake heights and differential breathers to prevent catastrophic engine hydraulic lock.

---

### 3. Enterprise Infrastructure Cockpit (PaaS)
* Order Management System (OMS): High-density console managing industrial purchase orders, automated rate contracts (ARC), and multi-axle freight assignments.
* Yard and Dock Snapper: Automated bay allocation matching container lengths, hydraulic dock leveler ratings, and turnaround schedules.
* Zero-Trust Cryptographic Ledger: High-throughput audit trail recording every state change, weighbridge reading, fuel transaction, and invoice acknowledgment in tamper-evident hash chains.

---

## Repository Structure

```
S.A.B.R.E/
|-- backend/
|   |-- api_server.py                       # FastAPI enterprise REST server and WebSocket streamer
|   |-- indian_transport_lifecycle_engine.py # 8-stage operational and financial state engine
|   |-- sabre_accounting_engine.py          # General ledger, trial balance, and tax invoice generator
|   |-- fleet_manager.py                    # Multi-axle telemetry, status aggregator, and geofencing
|   |-- swept_path_validator.py             # Trailer turning envelope and clearance verification
|   |-- brake_stress_indexer.py             # Thermal rotor accumulation on steep ghat descents
|   |-- iri_penalizer.py                    # Highway surface roughness cost modeling
|   |-- flood_wading_threshold.py           # Exhaust and intake wading depth safety enforcement
|   |-- enterprise_paas.py                  # Order management, warehouse bays, and workforce rules
|   |-- test_indian_transport_lifecycle.py  # Unit tests for the 8-stage lifecycle engine
|   |-- test_api_transport_lifecycle.py     # Endpoint tests for the lifecycle REST APIs
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- IndianTransportLifecycleApp.jsx # Interactive 8-stage transport workflow suite
|   |   |   |-- SabreEnterprisePaaS.jsx         # Operations, yard, container, and cargo cockpit
|   |   |   |-- MapOfIndia3D.jsx                # Tactical WebGL all-India radar and corridor map
|   |   |   |-- AiAgentNetworkChatbot.jsx       # Multi-agent dispatch and intelligence console
|   |   |   |-- SabreVideoStage.jsx             # Cinematic glassmorphic media presentation stage
|   |   |   |-- SabreLandingPage.jsx            # High-conversion interactive enterprise portal
|   |   |   |-- UniversalCommandPalette.jsx     # Keyboard-driven system launcher (Ctrl+K)
|   |   |-- App.jsx                             # View router, shortcuts, and global state coordinator
|   |-- public/
|   |   |-- sabre_motion_ad.mp4                 # 70-second motion graphics commercial with sound effects
|-- docs/
|   |-- SYSTEM_ARCHITECTURE.md              # In-depth architectural specification and benchmarks
|   |-- WIREFRAME_DESIGNS.md                # UI/UX design specifications and token systems
|-- build_motion_ad_sfx.py                  # Synthesized sound effects generator (WAV)
|-- render_sabre_motion_ad.py               # Frame-by-frame 30 FPS motion graphics renderer (MP4)
|-- start_sabre.bat                         # Windows quick-start launcher
|-- start_sabre.sh                          # Linux / POSIX quick-start launcher
|-- docker-compose.yml                      # Containerized multi-service deployment
```

---

## Technical Specifications

### Backend Services
* Language: Python 3.11+
* Framework: FastAPI / Uvicorn (Asynchronous ASGI)
* Connection Capacity: Engineered for 20,000+ concurrent telemetry sockets
* Data Persistence: SQLite / WAL mode with direct JSON state serialization
* Test Coverage: Comprehensive Pytest test suites across all physical and financial algorithms

### Frontend Application
* Language: Modern ECMAScript / React 19
* Build Tool: Vite
* Styling: Vanilla CSS custom design system with hardware-accelerated animations
* Mapping and Visualization: WebGL, BabylonJS, Leaflet, and HTML5 Canvas

### Media and Motion Graphics
* Video: H.264 / AVC 1280x720 (720p HD) @ 30.00 FPS (70.0 Seconds)
* Audio: Synchronized stereo sound effects (AAC 44,100 Hz, 192 kbps)

---

## Getting Started

### Prerequisites
* Python 3.11 or higher
* Node.js 18 or higher with npm
* Git

### Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/shreyasnr18/SABRE.git
cd SABRE
```

2. Configure backend dependencies:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

3. Configure frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Launch the application stack:

On Windows:
```cmd
start_sabre.bat
```

On Linux / macOS:
```bash
chmod +x start_sabre.sh
./start_sabre.sh
```

Alternatively, start the services independently:
```bash
# Terminal 1: Backend API Server
python backend/api_server.py

# Terminal 2: Frontend Client
cd frontend
npm run dev
```

The services will be active at:
* Frontend Client: http://localhost:5173
* Lifecycle Hub: http://localhost:5173/?app=lifecycle
* Backend API Documentation: http://localhost:8000/docs
* Health and Trips Endpoint: http://localhost:8000/api/v1/transport-lifecycle/trips

---

## Running the Automated Test Suites

Execute the comprehensive test suites:
```bash
# Test the 8-stage transport lifecycle engine
pytest backend/test_indian_transport_lifecycle.py

# Test the lifecycle REST API endpoints
pytest backend/test_api_transport_lifecycle.py

# Run all backend tests
pytest backend/
```

Verify frontend compilation:
```bash
cd frontend
npm run build
```

---

## Compliance and Statutory References
* Ministry of Road Transport and Highways (MoRTH) - VAHAN and SARATHI API Integration Standards
* Central Motor Vehicles Rules (CMVR) 1989 - Rule 137 (Hazardous Goods Driver Certification)
* Goods Transport Agency (GTA) Framework - Service Accounting Code (SAC) 9965
* Central Goods and Services Tax Act 2017 - Section 129 (Detention, Seizure, and Release of Goods in Transit)
* Income Tax Act 1961 - Section 194C(6) and Forms 15G / 15H (TDS Exemption on Goods Carriage)
* Trade Receivables Discounting System (TReDS) - Reserve Bank of India (RBI) Guidelines for MSME Factoring
* Carriage by Road Act 2007 - Carrier Liability and Consignment Documentation Standards

---

## License

Proprietary enterprise software. All rights reserved.
