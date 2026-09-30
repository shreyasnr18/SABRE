"""
============================================================================
S.A.B.R.E. DISTRIBUTED EVENT STREAMING BUS (APACHE KAFKA / LOCAL BUS)
Module: Real-time Highway Telemetry, Toll Plazas & Audit Stream
============================================================================
"""
import json
import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SabreKafkaBus")

# Standard SABRE Enterprise Topics
TOPIC_FLEET_TELEMETRY = "fleet.gps.telemetry"
TOPIC_FASTAG_TOLL_EVENTS = "fastag.toll.events"
TOPIC_BILTY_OCR_STREAM = "bilty.ocr.stream"
TOPIC_DEMURRAGE_COUNTDOWN = "demurrage.countdown"
TOPIC_SECURITY_AUDIT = "security.audit.events"

class SabreEventBus:
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers
        self.producer = None
        self.is_kafka_connected = False
        self._in_memory_event_store: Dict[str, List[Dict[str, Any]]] = {
            TOPIC_FLEET_TELEMETRY: [],
            TOPIC_FASTAG_TOLL_EVENTS: [],
            TOPIC_BILTY_OCR_STREAM: [],
            TOPIC_DEMURRAGE_COUNTDOWN: [],
            TOPIC_SECURITY_AUDIT: []
        }
        self._init_connection()

    def _init_connection(self):
        try:
            from kafka import KafkaProducer
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                request_timeout_ms=1500
            )
            self.is_kafka_connected = True
            logger.info(f"Connected to Apache Kafka Cluster at {self.bootstrap_servers}")
        except Exception as e:
            self.is_kafka_connected = False
            logger.info(f"Kafka cluster standby ({e}). Using High-Throughput In-Memory Event Streaming Bus.")

    def publish_event(self, topic: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        event_envelope = {
            "topic": topic,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "epoch_ms": int(time.time() * 1000),
            "payload": payload
        }

        # In-memory storage (capped at last 500 per topic for low memory footprint)
        if topic not in self._in_memory_event_store:
            self._in_memory_event_store[topic] = []
        self._in_memory_event_store[topic].append(event_envelope)
        if len(self._in_memory_event_store[topic]) > 500:
            self._in_memory_event_store[topic].pop(0)

        # Broadcast to external Kafka if connected
        if self.is_kafka_connected and self.producer:
            try:
                self.producer.send(topic, event_envelope)
            except Exception as e:
                logger.warning(f"Failed to publish to remote Kafka: {e}")

        return {
            "status": "DELIVERED",
            "topic": topic,
            "broker": "Apache Kafka 3.6 (Cluster)" if self.is_kafka_connected else "Local High-Speed RingBuffer",
            "timestamp": event_envelope["timestamp"]
        }

    def get_recent_events(self, topic: str, limit: int = 50) -> List[Dict[str, Any]]:
        events = self._in_memory_event_store.get(topic, [])
        return events[-limit:]

    def get_bus_status(self) -> Dict[str, Any]:
        total_events = sum(len(v) for v in self._in_memory_event_store.values())
        return {
            "broker_type": "Apache Kafka (KRaft)" if self.is_kafka_connected else "SABRE High-Speed Micro-EventBus",
            "is_kafka_connected": self.is_kafka_connected,
            "bootstrap_servers": self.bootstrap_servers,
            "active_topics": list(self._in_memory_event_store.keys()),
            "buffered_event_count": total_events
        }

# Global singleton
GLOBAL_EVENT_BUS = SabreEventBus()
