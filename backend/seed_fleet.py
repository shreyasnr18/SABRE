import sqlite3

conn = sqlite3.connect('sabre_fleet.db')
c = conn.cursor()

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

drivers_data = [
    ('DRV-1001', 'Rajesh Kumar', 'MH-04-2019-1234567', '4582 1290 8374', 'ABCDE1234F', 'ACTIVE'),
    ('DRV-1002', 'Vikram Singh', 'DL-14-2021-9876543', '9384 1029 3847', 'BCDEF2345G', 'ACTIVE'),
    ('DRV-1003', 'Ramesh Patel', 'GJ-01-2018-4567890', '5847 1029 4857', 'CDEFG3456H', 'RESTING'),
    ('DRV-1004', 'Manoj Sharma', 'UP-32-2020-1122334', '1029 3847 5647', 'DEFGH4567I', 'ACTIVE'),
    ('DRV-1005', 'Amit Desai', 'MH-12-2017-5566778', '8374 9182 7364', 'EFGHI5678J', 'ON-LEAVE'),
    ('DRV-1006', 'Gurpreet Singh', 'PB-08-2022-9988776', '2938 4756 1029', 'FGHIJ6789K', 'ACTIVE'),
    ('DRV-1007', 'Karthik N.', 'KA-01-2019-3344556', '8475 9283 1029', 'GHIJK7890L', 'ACTIVE'),
    ('DRV-1008', 'Suresh Reddy', 'AP-09-2021-7788990', '1928 3746 5019', 'HIJKL8901M', 'ACTIVE'),
    ('DRV-1009', 'Anand V.', 'TN-22-2018-2211334', '5849 1029 3847', 'IJKLM9012N', 'RESTING'),
    ('DRV-1010', 'Rahul Gupta', 'MP-04-2020-4433221', '3948 5768 1928', 'JKLMN0123O', 'ACTIVE')
]

fleet_data = [
    ('TRK-901', 'Heavy Duty Reefer', 6, 4.2, 'Cold Chain, Pharma, Perishables', 'AVAILABLE'),
    ('TRK-902', 'Container Hauler (40ft)', 5, 4.1, 'General Freight, Electronics', 'IN-TRANSIT'),
    ('TRK-903', 'Hazmat Tanker', 4, 3.8, 'Chemicals, Petroleum, Flammable', 'AVAILABLE'),
    ('TRK-904', 'Heavy Flatbed', 6, 3.2, 'Steel, Construction', 'MAINTENANCE'),
    ('TRK-905', 'Heavy Duty Reefer', 6, 4.2, 'Cold Chain, Pharma, Perishables', 'IN-TRANSIT'),
    ('TRK-906', 'Light Box Truck', 2, 3.5, 'FMCG, Parcel, Express', 'AVAILABLE'),
    ('TRK-907', 'Container Hauler (20ft)', 3, 4.0, 'General Freight', 'AVAILABLE'),
    ('TRK-908', 'Car Carrier', 6, 4.5, 'Automobiles', 'IN-TRANSIT'),
    ('TRK-909', 'Oversized Load Trailer', 8, 4.8, 'Heavy Machinery, Aerospace', 'AVAILABLE'),
    ('TRK-910', 'Bulk Liquid Tanker', 4, 3.7, 'Edible Oils, Milk', 'AVAILABLE'),
    ('TRK-911', 'Container Hauler (40ft)', 5, 4.1, 'General Freight, High-Value', 'AVAILABLE'),
    ('TRK-912', 'Hazmat Tanker', 4, 3.8, 'Chemicals, Compressed Gas', 'IN-TRANSIT'),
    ('TRK-913', 'Light Box Truck', 2, 3.5, 'FMCG, Parcel, Express', 'MAINTENANCE'),
    ('TRK-914', 'Heavy Flatbed', 6, 3.2, 'Steel, Pipes, Turbines', 'AVAILABLE'),
    ('TRK-915', 'Heavy Duty Reefer', 6, 4.2, 'Cold Chain, Pharma, Perishables', 'AVAILABLE')
]

c.executemany('INSERT OR IGNORE INTO erp_drivers VALUES (?, ?, ?, ?, ?, ?)', drivers_data)
c.executemany('INSERT OR IGNORE INTO erp_fleet VALUES (?, ?, ?, ?, ?, ?)', fleet_data)

conn.commit()
conn.close()
print("Data seeded successfully!")
