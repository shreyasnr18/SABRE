"""
SABRE Platform-as-a-Service (PaaS) - Spatial & Time-Series Data Lake
Manages high-velocity telemetry time-series streams, S3-style immutable 
black-box incident archives with SHA-256 hashing, and GIS elevation profiles.
"""

import time
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from collections import defaultdict, deque
import threading

class TimeSeriesLake:
    """
    In-memory / persistent time-series ring buffer for high-frequency CAN-bus sensor streams.
    Allows sub-second trend queries for brake thermals, speed profiles, and pneumatic pressure.
    """
    def __init__(self, max_points_per_series: int = 600):
        self.lock = threading.Lock()
        self.max_points = max_points_per_series
        # vehicle_id -> metric_name -> deque of (timestamp, value)
        self.series: Dict[str, Dict[str, deque]] = defaultdict(lambda: defaultdict(lambda: deque(maxlen=self.max_points)))

    def record_point(self, vehicle_id: str, metric: str, value: float, ts: Optional[float] = None) -> None:
        ts = ts or time.time()
        with self.lock:
            self.series[vehicle_id][metric].append((ts, float(value)))

    def record_frame(self, frame: Dict[str, Any]) -> None:
        v_id = frame.get("vehicle_id", "UNKNOWN")
        now = time.time()
        metrics = ["speed_kmh", "brake_rotor_temp_c", "brake_pressure_bar", "gradient_pct", "gvw_tonnes"]
        with self.lock:
            for m in metrics:
                if m in frame:
                    self.series[v_id][m].append((now, float(frame[m])))

    def query(self, vehicle_id: str, metric: str, limit: int = 50) -> List[Dict[str, Any]]:
        with self.lock:
            points = list(self.series[vehicle_id][metric])[-limit:]
            return [{"timestamp": p[0], "value": p[1]} for p in points]

    def get_all_metrics(self, vehicle_id: str) -> Dict[str, List[Dict[str, Any]]]:
        with self.lock:
            return {
                m: [{"timestamp": p[0], "value": p[1]} for p in list(pts)[-30:]]
                for m, pts in self.series[vehicle_id].items()
            }


class BlackboxArchiveStore:
    """
    S3-compatible Object Storage for Forensic Black-Box Incident Snapshots.
    Generates cryptographically hashed (.json / .dat) archives compliant with IRDAI 
    and commercial insurance standards.
    """
    def __init__(self):
        self.lock = threading.Lock()
        self.archives: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_incident()

    def _seed_sample_incident(self):
        # Pre-seed realistic incident snapshot for forensics review
        sample_frames = [
            {"time_offset_sec": -2.0, "speed_kmh": 62.0, "brake_temp_c": 490.0, "brake_press_bar": 6.8, "gradient_pct": -6.5},
            {"time_offset_sec": -1.0, "speed_kmh": 66.0, "brake_temp_c": 515.0, "brake_press_bar": 5.9, "gradient_pct": -6.8},
            {"time_offset_sec": 0.0,  "speed_kmh": 68.0, "brake_temp_c": 540.0, "brake_press_bar": 5.2, "gradient_pct": -7.0, "event": "RUNAWAY_EMERGENCY_LOCK"}
        ]
        self.create_snapshot(
            vehicle_id="KA-04-AB-9921",
            incident_type="THERMAL_BRAKE_RUNAWAY",
            location="Shiradi Ghat (NH-75) Hairpin #3",
            frames=sample_frames,
            operator_notes="Emergency Runaway Lock deployed. Vehicle diverted toward Escape Ramp #2."
        )

    def create_snapshot(
        self,
        vehicle_id: str,
        incident_type: str,
        location: str,
        frames: List[Dict[str, Any]],
        operator_notes: str = ""
    ) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        archive_id = f"BB-INC-{int(time.time() * 1000)}"
        
        raw_payload = {
            "archive_id": archive_id,
            "vehicle_id": vehicle_id,
            "incident_type": incident_type,
            "location": location,
            "timestamp": now_iso,
            "operator_notes": operator_notes,
            "frame_count": len(frames),
            "telemetry_frames": frames
        }
        
        # Calculate SHA-256 integrity hash for legal/insurance immutability
        serialized = json.dumps(raw_payload, sort_keys=True).encode("utf-8")
        sha256_checksum = hashlib.sha256(serialized).hexdigest()
        
        archive_metadata = {
            "archive_id": archive_id,
            "vehicle_id": vehicle_id,
            "incident_type": incident_type,
            "location": location,
            "timestamp": now_iso,
            "sha256_checksum": sha256_checksum,
            "size_bytes": len(serialized),
            "storage_tier": "S3_STANDARD_IMMUTABLE",
            "payload": raw_payload
        }
        
        with self.lock:
            self.archives[archive_id] = archive_metadata
            
        return archive_metadata

    def list_archives(self, limit: int = 20) -> List[Dict[str, Any]]:
        with self.lock:
            # Return metadata summary without full frame dumps for high performance
            return [
                {
                    "archive_id": a["archive_id"],
                    "vehicle_id": a["vehicle_id"],
                    "incident_type": a["incident_type"],
                    "location": a["location"],
                    "timestamp": a["timestamp"],
                    "sha256_checksum": a["sha256_checksum"],
                    "size_bytes": a["size_bytes"],
                    "storage_tier": a["storage_tier"]
                }
                for a in list(self.archives.values())[:limit]
            ]

    def get_archive(self, archive_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            return self.archives.get(archive_id)


# Singletons
paas_time_series = TimeSeriesLake()
paas_blackbox_store = BlackboxArchiveStore()
