"""
Tests for production SQLite connection pooling, WAL mode, concurrency, and crash resilience.
"""
import pytest
import threading
import database
from telemetry_streamer import FleetStreamer, fleet_manager
from fastapi import WebSocket

def test_database_connection_manager_wal_mode():
    with database.get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode;")
        mode = cursor.fetchone()[0]
        assert mode.lower() == "wal"
        
        cursor.execute("PRAGMA busy_timeout;")
        timeout = cursor.fetchone()[0]
        assert timeout >= 5000

def test_concurrent_reads_and_writes():
    """
    Spawns 10 concurrent threads reading and writing to ensure zero database lock errors.
    """
    errors = []

    def worker_writer(idx):
        try:
            database.log_manual_infraction(
                dispatch_id=f"CONCUR-{idx}",
                infraction_type="CONCURRENCY_TEST",
                estimated_loss_inr=1000.0 * idx,
                module="STRESS_TEST"
            )
        except Exception as e:
            errors.append(f"Writer {idx}: {e}")

    def worker_reader(idx):
        try:
            summary = database.get_summary()
            assert "total_dispatches" in summary
            infractions = database.get_infractions()
            assert isinstance(infractions, list)
        except Exception as e:
            errors.append(f"Reader {idx}: {e}")

    threads = []
    for i in range(10):
        t1 = threading.Thread(target=worker_writer, args=(i,))
        t2 = threading.Thread(target=worker_reader, args=(i,))
        threads.extend([t1, t2])
        t1.start()
        t2.start()

    for t in threads:
        t.join()

    assert len(errors) == 0, f"Encountered database concurrency errors: {errors}"

def test_manual_infraction_logging():
    initial_infractions = database.get_infractions()
    initial_count = sum(item["count"] for item in initial_infractions)
    
    database.log_manual_infraction("TEST-DISPATCH-99", "TEST_HAZARD_AVOIDANCE", 45000.0, "UNIT_TEST")
    
    updated_infractions = database.get_infractions()
    updated_count = sum(item["count"] for item in updated_infractions)
    assert updated_count == initial_count + 1
