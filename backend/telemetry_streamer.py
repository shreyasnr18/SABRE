import asyncio
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect
from fleet_manager import FleetManager

fleet_manager = FleetManager()

class FleetStreamer:
    def __init__(self, websocket: WebSocket):
        self.ws = websocket
        
    async def process_commands(self):
        try:
            while True:
                data = await self.ws.receive_json()
                cmd = data.get("command")
                if cmd == "PLAY":
                    fleet_manager.is_playing = True
                elif cmd == "PAUSE":
                    fleet_manager.is_playing = False
                elif cmd == "RESET":
                    fleet_manager.reset()
                elif cmd == "SPEED_1X":
                    fleet_manager.speed_multiplier = 1.0
                elif cmd == "SPEED_2X":
                    fleet_manager.speed_multiplier = 2.0
                elif cmd == "DISPATCH":
                    route = data.get("route", [])
                    truck_id = data.get("truck_id")
                    if route:
                        idle_truck = None
                        if truck_id:
                            idle_truck = next((t for t in fleet_manager.trucks if t["id"] == truck_id), None)
                        if not idle_truck:
                            idle_truck = next((t for t in fleet_manager.trucks if t["progress"] < 0 or t["progress"] >= 1.0), None)
                            
                        if idle_truck:
                            from sabre_orchestrator import SabreOrchestrator
                            orchestrator = SabreOrchestrator()
                            dispatch_order = {
                                "scenario_preset": idle_truck["label"],
                                "vehicle_id": idle_truck["id"],
                                "cargo_fragility": idle_truck["cargo"],
                                "height_meters": 3.0,
                                "departure_hour": 14.0
                            }
                            res = orchestrator.run_pipeline(dispatch_order)
                            idle_truck["db_dispatch_id"] = res.get("db_dispatch_id")
                            
                        fleet_manager.dispatch_custom_route(route, truck_id=idle_truck["id"] if idle_truck else None)
        except (WebSocketDisconnect, asyncio.CancelledError):
            pass
        except Exception as e:
            print(f"WS Command loop closed: {e}")

    async def stream(self):
        tick_counter = 0
        try:
            while True:
                tick_result = fleet_manager.tick()
                snapshots = tick_result.get("fleet", [])
                active_sos = tick_result.get("active_sos", None)
                event = "REROUTE_DISPATCHED" if fleet_manager.recent_event else None
                fleet_manager.recent_event = False
                
                payload = {
                    "fleet": snapshots,
                    "system_event": event,
                    "active_sos": active_sos
                }

                if tick_counter % 4 == 0:
                    try:
                        import database
                        from environment_connector import EnvironmentConnector
                        payload["analytics_summary"] = database.get_summary()
                        payload["analytics_infractions"] = database.get_infractions()
                        payload["environment_summary"] = EnvironmentConnector.get_live_weather(12.97, 77.59)
                    except Exception:
                        pass

                # Ultra-fast Rust-based orjson serialization for zero GIL blocking
                try:
                    import orjson
                    await self.ws.send_text(orjson.dumps(payload).decode('utf-8'))
                except Exception:
                    await self.ws.send_json(payload)
                    
                tick_counter += 1
                await asyncio.sleep(0.5)
        except (WebSocketDisconnect, asyncio.CancelledError):
            pass
        except Exception as e:
            print(f"WS Stream loop closed: {e}")
