"""
SABRE Retrieval-Augmented Generation (RAG) Knowledge Base & Search Engine
Comprehensive, authoritative indexing of the entire SABRE infrastructure:
- 50 Proprietary Transport Cloud PaaS microservices (COMP-01..08, NET-09..16, STOR-17..22, DB-23..28, STREAM-29..34, IOT-35..40, SEC-41..45, AI-46..50)
- 6 PaaS Foundational Layers (CORE-01..06) & 6 Multi-tenant Subsystems
- Western Ghats Highway Corridors: NH-75 (Shiradi Ghat), NH-275 (Sampaje Ghat), NH-48 (Charmadi Ghat), NH-66 Coastal
- Emergency Escape Ramps & Arrester Beds (Pea Gravel, Graded Sand, Aggregate Drag)
- Physics & Safety Engine: CAN-bus telematics, predictive brake thermal runaway (AI-49), retarder governor stages, deceleration threshold (>4 m/s²), weigh-in-motion (WIM)
- Human-in-the-loop safety interlocks & 2-task micro-agent constraints
"""

import re
from typing import List, Dict, Any

KNOWLEDGE_CORPUS: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # 1. CORE SYSTEM ARCHITECTURE & PHILOSOPHY
    # -------------------------------------------------------------------------
    {
        "id": "ARCH-OVERVIEW",
        "title": "SABRE Core System Architecture Overview",
        "category": "Architecture",
        "keywords": ["sabre", "what is sabre", "overview", "system", "platform", "paas", "cloud", "sovereignty", "zero external apis"],
        "content": (
            "SABRE (Sovereign Autonomous Blockchain-telematics & Real-time Execution) is an enterprise-grade "
            "Platform-as-a-Service (PaaS) and autonomous transport orchestration engine engineered for mission-critical heavy freight "
            "logistics, steep mountain passes, and highway infrastructure. It runs with 100% sovereign execution: strictly zero external "
            "APIs (no OpenAI, Gemini, Claude, or Grok egress) and strictly zero Chinese models. All intelligence is processed locally "
            "on dedicated neural hardware with local LoRA transfer learning adapters."
        )
    },
    {
        "id": "ARCH-6-FOUNDATIONS",
        "title": "The 6 Mandatory PaaS Foundational Layers (CORE-01 to CORE-06)",
        "category": "Architecture",
        "keywords": ["foundational layers", "6 layers", "core components", "paas foundation", "runtime", "middleware", "persistence"],
        "content": (
            "SABRE implements the 6 mandatory core PaaS architecture layers:\n"
            "1. CORE-01: Runtime Environments & Polyglot Execution Engines (Node.js 18-22, Python 3.10-3.12, Java 17-21, .NET 8-9, Go 1.21-1.22, Ruby, PHP).\n"
            "2. CORE-02: Fully Managed Middleware (API Gateways, message queues, connection poolers, distributed caching).\n"
            "3. CORE-03: Database & Storage Persistence Management (Managed PostgreSQL 16, Redis, MinIO S3 object storage with auto-injection of DATABASE_URL).\n"
            "4. CORE-04: Abstracted Operating System & Virtualization (cgroups v2, sandboxed container Dynos/Pods, AppArmor profiles).\n"
            "5. CORE-05: Smart Layer 7 Ingress Networking & Routing (Reverse proxies, automated Let's Encrypt TLS/SSL termination, health-check failover).\n"
            "6. CORE-06: Development Tools & Deployment Automation (Cloud Native Buildpacks, git-push-to-deploy, continuous log tailing)."
        )
    },
    {
        "id": "ARCH-6-SUBSYSTEMS",
        "title": "The 6 Multi-Tenant Technical Subsystems",
        "category": "Architecture",
        "keywords": ["6 subsystems", "multi-tenant", "technical subsystems", "dynos", "buildpacks", "persistence gateway", "logging aggregator"],
        "content": (
            "The platform contains 6 technical multi-tenant subsystems:\n"
            "1. Multi-Tenant Container Orchestration: Dyno sandboxes, namespace isolation, and CPU/RAM cgroups v2 quotas.\n"
            "2. Automated Build Pipelines: Auto-detects runtime via Cloud Native Buildpacks (CNB) and compiles deployable OCI images.\n"
            "3. Smart Layer 7 Ingress: Dynamic SSL termination, path-based routing, and zero-downtime blue/green rollouts.\n"
            "4. Dynamic Autoscalers & Load Balancers: Horizontal Pod Autoscaler (HPA) triggering on queue depth and CPU thresholds.\n"
            "5. Persistence Gateways: Provisions isolated PostgreSQL schemas/databases and injects DATABASE_URL credentials.\n"
            "6. Centralized Logging & Telemetry Aggregators: Continuous scraping of stdout/stderr with real-time tailing and regex filtering."
        )
    },

    # -------------------------------------------------------------------------
    # 2. HIGHWAY CORRIDORS & GEOGRAPHY (WESTERN GHATS)
    # -------------------------------------------------------------------------
    {
        "id": "CORRIDOR-NH75",
        "title": "NH-75 Western Ghats Corridor (Shiradi Ghat)",
        "category": "Corridors",
        "keywords": ["nh-75", "nh75", "shiradi", "shiradi ghat", "bengaluru", "mangalore", "sakleshpur", "gundya"],
        "content": (
            "NH-75 (Shiradi Ghat) connects Bengaluru to Mangalore through the Western Ghats between Sakleshpur and Gundya. "
            "It features severe 14% downhill gradients, 18 hairpin curves, and heavy monsoon rains (June-September). "
            "SABRE continuously monitors brake rotor thermal profiles and transmission temperatures along this corridor. "
            "If continuous downhill descent raises brake drum temperatures past 450°C, the system executes automated warning protocols "
            "and dynamically reroutes or recommends emergency runaway arrester beds."
        )
    },
    {
        "id": "CORRIDOR-NH275",
        "title": "NH-275 Western Ghats Corridor (Sampaje / Madikeri Ghat)",
        "category": "Corridors",
        "keywords": ["nh-275", "nh275", "sampaje", "madikeri", "coorg", "mysuru", "mangalore", "failover corridor"],
        "content": (
            "NH-275 passes through Kushalnagar, Madikeri, and Sampaje towards Sullya and Mangalore. It serves as the primary "
            "automated failover route for freight when NH-75 Shiradi Ghat experiences landslides, rockfalls, or road blockages. "
            "While having slightly milder average gradients than Shiradi, Sampaje Ghat has narrow dual-lane carriageways and dense fog, "
            "requiring stricter radar proximity tracking and lower maximum speed governors."
        )
    },
    {
        "id": "CORRIDOR-NH48",
        "title": "NH-48 Western Ghats Corridor (Charmadi Ghat)",
        "category": "Corridors",
        "keywords": ["nh-48", "nh48", "charmadi", "charmadi ghat", "mudigere", "ujire", "belthangady", "hairpin"],
        "content": (
            "NH-48 (Charmadi Ghat) connects Mudigere to Ujire/Belthangady. It features 11 extreme hairpin bends, single-lane pinch points, "
            "and steep cliff edges. Heavy multi-axle trailers (>42 tonnes) are heavily restricted or speed-governed here. SABRE "
            "enforces automated weighbridge alerts and maintains proximity tracking to the Charmadi Hairpin 7 Arrester Bed."
        )
    },
    {
        "id": "ESCAPE-RAMPS",
        "title": "Emergency Escape Ramps & Runaway Arrester Beds",
        "category": "Safety & Infrastructure",
        "keywords": ["escape ramp", "runaway ramp", "arrester bed", "shiradi ramp", "brake failure", "pea gravel", "sand bed"],
        "content": (
            "SABRE integrates low-latency geospatial radar (DB-25) with physical runaway escape ramps in the Western Ghats:\n"
            "1. RAMP-SHIRADI-01: Shiradi Escape Ramp #1 (Upper) at elevation 620m [75.6320, 12.8680], using Pea Gravel Arrester.\n"
            "2. RAMP-SHIRADI-02: Shiradi Escape Ramp #2 (Lower) at elevation 410m [75.6480, 12.8750], using Graded Sand Drag Bed.\n"
            "3. RAMP-CHARMADI-01: Charmadi Hairpin 7 Arrester Bed at elevation 580m [75.4520, 13.0610], using Aggregate Drag Ramp.\n"
            "Spatial lookup computes bearing and arrival distance in under 2ms during emergency brake overrun triggers."
        )
    },

    # -------------------------------------------------------------------------
    # 3. 1. COMPUTE & WORKLOAD ORCHESTRATION (COMP-01 to COMP-08)
    # -------------------------------------------------------------------------
    {
        "id": "CAT-COMPUTE",
        "title": "1. Compute & Workload Orchestration (COMP-01 to COMP-08)",
        "category": "Compute Microservices",
        "keywords": ["comp-01", "comp-02", "comp-03", "comp-04", "comp-05", "comp-06", "comp-07", "comp-08", "evn", "tcu", "serverless", "weighbridge"],
        "content": (
            "All 8 Compute & Workload Microservices:\n"
            "- COMP-01 Elastic Vehicle Node Provisioning (EVN): Maps virtualized compute instances to in-vehicle TCUs, managing vCPU, RAM, and CAN schedulers.\n"
            "- COMP-02 Spatial & Telemetry Serverless Triggers: Event-driven functions executing on CAN-bus state changes, deceleration spikes >4 m/s², rotor temp >450°C.\n"
            "- COMP-03 Dynamic Fleet Capacity Scaling Pools: Autonomous hauler scaling based on corridor queues and weighbridge backlogs.\n"
            "- COMP-04 Containerized In-Vehicle Edge Runtimes: Sandboxed OCI container runtimes embedded on vehicle microcontrollers.\n"
            "- COMP-05 Overnight Low-Temp Manifest Batching: Off-peak scheduler compiling manifests for 02:00-05:00 AM dispatch during cool ambient temperatures.\n"
            "- COMP-06 Toll Plaza On-Prem Weighbridge Appliance: Integrates Weigh-In-Motion (WIM) sensors with FASTag at 10ms latency.\n"
            "- COMP-07 Instant 3PL Dispatch Microservice Deploy: Turnkey spin-up of enterprise logistics partner webhooks and APIs in <15s.\n"
            "- COMP-08 Turnkey State Transport Portal Deployer: Automated deployment stack creating compliant freight portals for State Undertakings (KSRTC, MSRTC)."
        )
    },

    # -------------------------------------------------------------------------
    # 4. 2. NETWORKING & DELIVERY (NET-09 to NET-16)
    # -------------------------------------------------------------------------
    {
        "id": "CAT-NETWORKING",
        "title": "2. Networking & Delivery (NET-09 to NET-16)",
        "category": "Networking Microservices",
        "keywords": ["net-09", "net-10", "net-11", "net-12", "net-13", "net-14", "net-15", "net-16", "corridor routing", "pfn", "mesh"],
        "content": (
            "All 8 Networking & Delivery Microservices:\n"
            "- NET-09 Dynamic Corridor Traffic & Route Failover: Probes highway health and shifts traffic from NH-75 Shiradi to NH-275 Sampaje or NH-48 on landslides.\n"
            "- NET-10 Corridor Edge Tile & Hazard Cache: Low-latency offline edge cache for 3D elevation maps, hairpin curvature, and escape ramp coordinates.\n"
            "- NET-11 Virtual Private Fleet (PFN) Network Isolation: Cryptographically isolated IPsec/WireGuard network partitions for defence, HAZMAT, and cold-chain.\n"
            "- NET-12 OEM Telematics Gateway & Rate Limiter: Ingress reverse-proxy for Tata, Ashok Leyland, BharatBenz, Volvo with DDoS scrub and rate limits.\n"
            "- NET-13 Dedicated Logistics Hub Fiber Link: Low-jitter 10 Gbps fiber link connecting cloud hubs to dry ports and inland freight stations.\n"
            "- NET-14 Inter-State Transport Hub Interconnect: Peered transit exchange synchronizing freight manifests across KA, MH, TN, KL borders.\n"
            "- NET-15 Secure National Highway Authority Link: Government-certified VPN tunnel reporting axle overloads and incidents directly to NHAI.\n"
            "- NET-16 Port-to-Inland Long-Haul Telemetry Accelerator: Zstandard network compression optimizing telemetry from New Mangalore Port to inland hubs."
        )
    },

    # -------------------------------------------------------------------------
    # 5. 3. STORAGE & DATA PERSISTENCE (STOR-17 to STOR-22)
    # -------------------------------------------------------------------------
    {
        "id": "CAT-STORAGE",
        "title": "3. Storage & Data Persistence (STOR-17 to STOR-22)",
        "category": "Storage Microservices",
        "keywords": ["stor-17", "stor-18", "stor-19", "stor-20", "stor-21", "stor-22", "black-box", "worm", "archive", "lidar", "rfid"],
        "content": (
            "All 6 Storage & Data Persistence Microservices:\n"
            "- STOR-17 Black-Box Forensic Incident Object Lake: WORM-compliant store capturing 60-second pre/post-crash telemetry with immutable SHA-256 HMAC timestamps.\n"
            "- STOR-18 Statutory 7-Year Compliance Long-Term Archive: Ultra-cold archival tier for completed trip records and IRDAI insurance dispute retention.\n"
            "- STOR-19 High-IOPS TCU State Block Storage: NVMe-backed block storage on vehicle edge nodes for zero-loss circular buffering during network deadzones.\n"
            "- STOR-20 Shared Corridor Spatial Asset Filesystem: Distributed NFSv4.1/SMBv3 filesystem sharing 3D Digital Elevation Models and maps across consoles.\n"
            "- STOR-21 Offline High-Density LiDAR Extraction Kit: Bulk offload pipeline for 100-million point LiDAR surveys from mapping trucks.\n"
            "- STOR-22 Hybrid Warehouse RFID/WMS Gateway: Local caching appliance syncing pallet RFID tallies, forklift scales, and warehouse floor states in real-time."
        )
    },

    # -------------------------------------------------------------------------
    # 6. 4. DATABASES & CACHING (DB-23 to DB-28)
    # -------------------------------------------------------------------------
    {
        "id": "CAT-DATABASES",
        "title": "4. Databases & Caching (DB-23 to DB-28)",
        "category": "Database Microservices",
        "keywords": ["db-23", "db-24", "db-25", "db-26", "db-27", "db-28", "time-series", "spatial radar", "fleet state", "graph db"],
        "content": (
            "All 6 Databases & Caching Microservices:\n"
            "- DB-23 CAN-Bus Sub-Second Time-Series Engine: High-write time-series DB storing 50Hz continuous CAN telemetry (brake pressure, wheel RPM, coolant temp).\n"
            "- DB-24 Real-Time Fleet State Key-Value Store: In-memory distributed state store holding live coordinates, speed, bearing, and active warnings at 1.4ms latency.\n"
            "- DB-25 Runaway Ramp Proximity & Spatial Radar: Low-latency geospatial radar using Geohash-9/H3 to scan the nearest escape ramp within <2ms.\n"
            "- DB-26 Enterprise Freight & ERP Relational Core: ACID-compliant relational core managing billing ledgers, driver duty hours (HOS), and freight waybills.\n"
            "- DB-27 National Highway Topology Graph DB: Graph database modeling highway network with slope gradients, hairpin sharpness, and bridge axle limits.\n"
            "- DB-28 Logistics Freight & Incident Search Engine: Distributed inverted-index search cluster for incident reports, safety audits, and cargo manifests."
        )
    },

    # -------------------------------------------------------------------------
    # 7. 5. REAL-TIME STREAMING & ANALYTICS (STREAM-29 to STREAM-34)
    # -------------------------------------------------------------------------
    {
        "id": "CAT-STREAMING",
        "title": "5. Real-Time Streaming & Analytics (STREAM-29 to STREAM-34)",
        "category": "Streaming Microservices",
        "keywords": ["stream-29", "stream-30", "stream-31", "stream-32", "stream-33", "stream-34", "parquet", "spark", "event bus", "telemetry"],
        "content": (
            "All 6 Real-Time Streaming & Analytics Microservices:\n"
            "- STREAM-29 High-Throughput Raw Telemetry Pipeline: Massively partitioned stream ingesting up to 100,000 frames/sec from vehicle CAN-buses.\n"
            "- STREAM-30 Zero-Code Telemetry Columnar Ingestion: Converts streaming sensor JSON into compressed Snappy/ZSTD Apache Parquet files.\n"
            "- STREAM-31 Enterprise Logistics Event Bus: Decoupled pub/sub event router distributing business events (Toll Crossed, Overheat Warning, Impact).\n"
            "- STREAM-32 Serverless SQL Telematics Query Engine: Interactive ANSI SQL query engine scanning petabyte-scale Parquet telemetry without servers.\n"
            "- STREAM-33 State-Wide Freight Flow Big-Data Spark: Managed Apache Spark cluster running daily graph analytics on state freight flows and bottlenecks.\n"
            "- STREAM-34 Automated OEM Telematics ETL & Schema Sync: Auto-crawler discovering disparate telematics schemas across truck OEMs and harmonizing formats."
        )
    },

    # -------------------------------------------------------------------------
    # 8. 6. IOT & VEHICLE EDGE SPECIALIZED (IOT-35 to IOT-40)
    # -------------------------------------------------------------------------
    {
        "id": "CAT-IOT",
        "title": "6. IoT & Vehicle Edge Specialized (IOT-35 to IOT-40)",
        "category": "IoT Microservices",
        "keywords": ["iot-35", "iot-36", "iot-37", "iot-38", "iot-39", "iot-40", "j1939", "mqtt", "tamper", "anti-spoofing", "dispatch broadcast"],
        "content": (
            "All 6 IoT & Vehicle Edge Microservices:\n"
            "- IOT-35 CAN-Bus J1939 Signal Harvester & Filter: Hardware-level edge decoder filtering J1939 PGNs and SPNs (SPN-575 Retarder, SPN-1087 Air Pressure).\n"
            "- IOT-36 Secure Telematics Vehicle Ingestion Broker: Bi-directional MQTT/TLS gateway with persistent low-power device communication and QoS 1.\n"
            "- IOT-37 Offline Autonomous Valley Safety Controller: Embedded cab controller operating autonomously during zero-reception descents to govern retarders.\n"
            "- IOT-38 Telematics Tamper & GPS Anti-Spoofing: Anomaly detector checking for GPS spoofing, wire-cutting on speed sensors, and rogue OBD intrusions.\n"
            "- IOT-39 Dispatch Work Order & Queue Pipeline: Reliable FIFO queue coordinating load assignments, dock slots, and weighbridge clearances.\n"
            "- IOT-40 Critical Emergency Automated Dispatch Broadcast: Priority push service triggering SMS, in-cabin sirens (95dB), and state highway patrol 112 calls."
        )
    },

    # -------------------------------------------------------------------------
    # 9. 7. SECURITY, IAM & COMPLIANCE (SEC-41 to SEC-45)
    # -------------------------------------------------------------------------
    {
        "id": "CAT-SECURITY",
        "title": "7. Security, IAM & Compliance (SEC-41 to SEC-45)",
        "category": "Security Microservices",
        "keywords": ["sec-41", "sec-42", "sec-43", "sec-44", "sec-45", "rbac", "hsm", "fastag vault", "ingestion shield", "audit trail"],
        "content": (
            "All 5 Security, IAM & Compliance Microservices:\n"
            "- SEC-41 Transport Role-Based Access Control (RBAC): Enforces granular permissions (Fleet Manager, Dispatcher, PWD Bridge Officer, Police) with MFA.\n"
            "- SEC-42 Cryptographic Hardware Vehicle Keys: HSM key management storing AES-256 master keys for vehicle firmware validation and CAN-bus signing.\n"
            "- SEC-43 Toll Plaza FASTag & NPCI Credential Vault: FIPS-140-Level-3 encrypted secrets vault storing NPCI keys with 30-day automated rotation.\n"
            "- SEC-44 PaaS Ingestion Shield & Rate Protection: Layer-7 API firewall protecting telematics endpoints against payload poisoning and rogue CAN frames.\n"
            "- SEC-45 Regulatory Transport Dispatch Audit Trail: Immutable append-only HMAC-chained audit log recording every dispatch, reroute, and permit issuance."
        )
    },

    # -------------------------------------------------------------------------
    # 10. 8. AI, PREDICTIVE SAFETY & VISION (AI-46 to AI-50)
    # -------------------------------------------------------------------------
    {
        "id": "CAT-AI-SAFETY",
        "title": "8. AI, Predictive Safety & Vision (AI-46 to AI-50)",
        "category": "AI Microservices",
        "keywords": ["ai-46", "ai-47", "ai-48", "ai-49", "ai-50", "predictive brake", "cockpit", "ota", "fatigue", "perclos", "thermal runaway"],
        "content": (
            "All 5 AI, Predictive Safety & Vision Microservices:\n"
            "- AI-46 Fleet Vitals & Real-Time Infrastructure Cockpit: Live telemetry dashboard tracking brake temps, speeds, fuel burn, and retarder status.\n"
            "- AI-47 3PL Logistics Outbound Webhook Bus: High-reliability webhook dispatcher pushing milestone notifications and delay alerts with HMAC signatures.\n"
            "- AI-48 Over-The-Air Fleet Command & Diagnostics: Hot-deploy framework pushing retarder mapping curves and ECU firmware over CoAP/DTLS to moving trucks.\n"
            "- AI-49 15-Minute Predictive Brake Overrun Model: Thermodynamic LSTM model forecasting brake rotor temperatures 15 mins ahead; triggers alert if >450°C.\n"
            "- AI-50 Driver Fatigue & Eye PERCLOS Vision AI: In-cabin camera computer vision model tracking percentage of eye closure (PERCLOS) and seat haptic alerts."
        )
    },

    # -------------------------------------------------------------------------
    # 11. MULTI-AGENT SWARM RULES & CAPACITY CONSTRAINTS
    # -------------------------------------------------------------------------
    {
        "id": "AGENT-SWARM-RULES",
        "title": "Micro-Agent Swarm & 2-Task Capacity Constraint",
        "category": "Agent Swarm",
        "keywords": ["agent swarm", "2-task", "capacity", "compute agent", "network agent", "storage agent", "policy agent", "safety gate"],
        "content": (
            "The SABRE AI agent swarm enforces an architectural safety rule: STRICT 2-TASK CAPACITY per micro-agent.\n"
            "1. Compute Worker Agent (AGENT-COMPUTE): Task 1: Allocate EVN compute sandbox; Task 2: Enforce cgroups v2 kernel quotas.\n"
            "2. Network Worker Agent (AGENT-NETWORK): Task 1: Resolve automated SSL/TLS certificate; Task 2: Bind L7 reverse proxy ingress.\n"
            "3. Storage Worker Agent (AGENT-STORAGE): Task 1: Provision isolated database schema; Task 2: Inject DATABASE_URL credentials.\n"
            "4. Policy Worker Agent (AGENT-POLICY): Task 1: Compile AppArmor containment policy; Task 2: Register cryptographic audit trace.\n"
            "After all 4 agents complete their 2 tasks, the system stages the deployment and holds behind the Human-in-the-Loop Safety Gate (GOV-50)."
        )
    }
]

class SabreRagIndex:
    """
    Lightweight, high-speed, local in-memory inverted index and RAG retriever.
    Extracts top relevant chunks based on token and semantic overlap.
    """
    def __init__(self):
        self.corpus = KNOWLEDGE_CORPUS

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_normalized = query.lower()
        query_words = set(re.findall(r'\b[a-z0-9\-_]{2,}\b', query_normalized))

        scored_results = []
        for doc in self.corpus:
            score = 0.0
            
            # Check exact keyword matches
            for kw in doc.get("keywords", []):
                if kw in query_normalized:
                    score += 6.0
                for qw in query_words:
                    if qw == kw or (len(qw) > 3 and qw in kw):
                        score += 3.0

            # Title matching
            title_words = set(re.findall(r'\b[a-z0-9\-_]{2,}\b', doc["title"].lower()))
            overlap_title = query_words.intersection(title_words)
            score += len(overlap_title) * 4.0

            # Content matching
            content_lower = doc["content"].lower()
            for qw in query_words:
                if len(qw) > 2 and qw in content_lower:
                    score += 1.2

            if score > 0:
                scored_results.append((score, doc))

        # Sort by relevance score descending
        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_results[:top_k]]

    def format_context_for_prompt(self, query: str, top_k: int = 3) -> str:
        matched_docs = self.retrieve(query, top_k=top_k)
        if not matched_docs:
            return ""

        chunks = []
        for d in matched_docs:
            chunks.append(f"[{d['title']} ({d['category']})]:\n{d['content']}")
        return "\n\n".join(chunks)

sabre_rag_index = SabreRagIndex()
