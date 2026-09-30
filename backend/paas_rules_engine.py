"""
SABRE Platform-as-a-Service (PaaS) - Programmable Event Triggers & Stream Compute Engine
Executes serverless rules on live telematics frames, evaluates thermodynamic & kinematic 
physics limits, and dispatches automated infrastructure actions.
"""

import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import operator
import threading

# Dynamic condition operators
OPERATORS = {
    ">": operator.gt,
    ">=": operator.ge,
    "<": operator.lt,
    "<=": operator.le,
    "==": operator.eq,
    "!=": operator.ne,
}

class ServerlessRule:
    def __init__(
        self,
        rule_id: str,
        name: str,
        conditions: List[Dict[str, Any]],
        actions: List[Dict[str, Any]],
        severity: str = "WARNING",
        tenant_id: str = "ALL",
        cooldown_seconds: int = 30
    ):
        self.rule_id = rule_id
        self.name = name
        self.conditions = conditions
        self.actions = actions
        self.severity = severity
        self.tenant_id = tenant_id
        self.cooldown_seconds = cooldown_seconds
        self.last_triggered: Dict[str, float] = {}  # vehicle_id -> timestamp

    def evaluate(self, frame: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Tenant isolation check
        if self.tenant_id != "ALL" and frame.get("tenant_id") != self.tenant_id:
            return None
            
        vehicle_id = frame.get("vehicle_id", "UNKNOWN")
        now = time.time()
        
        # Check cooldown to prevent event flooding
        if vehicle_id in self.last_triggered:
            if now - self.last_triggered[vehicle_id] < self.cooldown_seconds:
                return None

        # Evaluate all conditions (AND logic)
        for cond in self.conditions:
            metric = cond.get("metric")
            op_symbol = cond.get("operator")
            target_value = cond.get("value")
            
            if metric not in frame:
                return None
                
            frame_value = frame[metric]
            op_func = OPERATORS.get(op_symbol)
            if not op_func:
                return None
                
            try:
                if not op_func(float(frame_value), float(target_value)):
                    return None
            except (ValueError, TypeError):
                if not op_func(str(frame_value), str(target_value)):
                    return None

        # Trigger fired!
        self.last_triggered[vehicle_id] = now
        
        return {
            "trigger_id": f"TRIG-{int(now * 1000)}",
            "rule_id": self.rule_id,
            "rule_name": self.name,
            "severity": self.severity,
            "vehicle_id": vehicle_id,
            "tenant_id": frame.get("tenant_id", "TENANT_DEFAULT"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "telemetry_snapshot": {
                "latitude": frame.get("latitude"),
                "longitude": frame.get("longitude"),
                "speed_kmh": frame.get("speed_kmh"),
                "brake_rotor_temp_c": frame.get("brake_rotor_temp_c"),
                "gvw_tonnes": frame.get("gvw_tonnes"),
                "gradient_pct": frame.get("gradient_pct", 0.0)
            },
            "executed_actions": self.actions
        }


class StreamComputeEngine:
    """
    Stream Compute Processor that evaluates rules across incoming normalized frames
    and maintains an audit log of triggered infrastructure events.
    """
    def __init__(self):
        self.lock = threading.Lock()
        self.rules: Dict[str, ServerlessRule] = {}
        self.triggered_events: List[Dict[str, Any]] = []
        self._init_standard_rules()

    def _init_standard_rules(self):
        # 1. Thermal Rotor Runaway Alert
        self.register_rule(ServerlessRule(
            rule_id="RULE-THERMAL-01",
            name="Thermal Rotor Runaway Alert (>450 deg C)",
            conditions=[
                {"metric": "brake_rotor_temp_c", "operator": ">", "value": 450.0}
            ],
            actions=[
                {"type": "DISPATCH_EMERGENCY_ALERT", "details": "Alert highway patrol & recommend Runaway Ramp #2"},
                {"type": "ENGAGE_EDGE_OTA", "profile": "EMERGENCY_RUNAWAY_LOCK"},
                {"type": "NOTIFY_WEBHOOK", "topic": "incident.thermal_runaway"}
            ],
            severity="CRITICAL",
            cooldown_seconds=45
        ))
        
        # 2. Ghat Overspeed & Grade Hazard
        self.register_rule(ServerlessRule(
            rule_id="RULE-GRADE-OVERSPEED-02",
            name="Steep Descent Overspeed Hazard (>65 km/h)",
            conditions=[
                {"metric": "speed_kmh", "operator": ">", "value": 65.0},
                {"metric": "gradient_pct", "operator": "<", "value": -4.0}
            ],
            actions=[
                {"type": "RESTRICT_THROTTLE", "speed_cap": 40.0},
                {"type": "NOTIFY_WEBHOOK", "topic": "safety.ghat_overspeed"}
            ],
            severity="HIGH",
            cooldown_seconds=30
        ))
        
        # 3. Overloaded Bridge Approach
        self.register_rule(ServerlessRule(
            rule_id="RULE-BRIDGE-LOAD-03",
            name="Bridge Structural Gross Overweight (>45T)",
            conditions=[
                {"metric": "gvw_tonnes", "operator": ">", "value": 45.0}
            ],
            actions=[
                {"type": "FLAG_BRIDGE_WIM_COMPLIANCE", "details": "Validate Netravati River Bridge tonnage clearance"},
                {"type": "NOTIFY_WEBHOOK", "topic": "compliance.bridge_overweight"}
            ],
            severity="WARNING",
            cooldown_seconds=60
        ))

    def register_rule(self, rule: ServerlessRule) -> None:
        with self.lock:
            self.rules[rule.rule_id] = rule

    def delete_rule(self, rule_id: str) -> bool:
        with self.lock:
            if rule_id in self.rules:
                del self.rules[rule_id]
                return True
            return False

    def list_rules(self) -> List[Dict[str, Any]]:
        with self.lock:
            return [
                {
                    "rule_id": r.rule_id,
                    "name": r.name,
                    "severity": r.severity,
                    "tenant_id": r.tenant_id,
                    "conditions": r.conditions,
                    "actions": r.actions,
                    "cooldown_seconds": r.cooldown_seconds
                }
                for r in self.rules.values()
            ]

    def process_frame(self, frame: Dict[str, Any]) -> List[Dict[str, Any]]:
        fired_events = []
        with self.lock:
            for rule in self.rules.values():
                event = rule.evaluate(frame)
                if event:
                    fired_events.append(event)
                    self.triggered_events.insert(0, event)
                    
            # Keep triggered events buffer bounded
            if len(self.triggered_events) > 200:
                self.triggered_events = self.triggered_events[:200]
                
        return fired_events

    def get_triggered_events(self, limit: int = 30) -> List[Dict[str, Any]]:
        with self.lock:
            return self.triggered_events[:limit]


# Global stream compute instance
paas_compute_engine = StreamComputeEngine()
