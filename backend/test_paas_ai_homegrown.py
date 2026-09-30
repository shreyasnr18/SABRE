import pytest
from paas_ai_homegrown_engine import (
    SovereignModelRegistry,
    LocalBytePairTokenizer,
    HardwareSlidingRateLimiter,
    SovereignAiHomegrownEngine,
    FORBIDDEN_ORIGIN_KEYWORDS
)

def test_sovereign_model_compliance_and_zero_chinese_models():
    tiers = SovereignModelRegistry.get_tier_configs()
    assert len(tiers) == 3
    assert "Normal" in tiers
    assert "Pro" in tiers
    assert "Max" in tiers

    # Verify each tier uses strictly Western/EU open source models and zero Chinese models
    for tier_name, cfg in tiers.items():
        base_lower = cfg["base_model"].lower()
        for forbidden in FORBIDDEN_ORIGIN_KEYWORDS:
            assert forbidden not in base_lower, f"Forbidden keyword {forbidden} found in {base_lower}"
            assert forbidden not in cfg["origin"].lower()

    # Normal tier must be Mistral Apache 2.0
    assert "Mistral" in tiers["Normal"]["base_model"]
    assert "Apache 2.0" in tiers["Normal"]["license"]

    # Pro tier must be Llama Meta open access
    assert "Llama" in tiers["Pro"]["base_model"]
    assert "Meta" in tiers["Pro"]["origin"]

    # Max tier must be Apache 2.0 permissive
    assert "Apache 2.0" in tiers["Max"]["license"]

def test_local_bpe_tokenizer_and_cost_meter():
    text = "Deploy high-frequency vehicle telemetry pipeline with dynamic corridor failover"
    tokens = LocalBytePairTokenizer.count_tokens(text)
    assert tokens > 10

    tiers = SovereignModelRegistry.get_tier_configs()
    cost = LocalBytePairTokenizer.calculate_cost(tokens, 450, tiers["Pro"])
    assert cost["total_tokens"] == tokens + 450
    assert cost["cost_inr"] > 0
    assert cost["cost_usd"] > 0

def test_hardware_rate_limiter_rpm():
    limiter = HardwareSlidingRateLimiter()
    tiers = SovereignModelRegistry.get_tier_configs()
    normal_cfg = tiers["Normal"]

    # Normal tier limit is 60 RPM
    res1 = limiter.check_and_record("Normal", 100, normal_cfg)
    assert res1["allowed"] is True
    assert res1["current_rpm"] == 1

def test_coordinator_agent_and_dual_branch_action_plan():
    engine = SovereignAiHomegrownEngine()
    prompt = "Configure Western Ghats NH-75 Shiradi fleet telemetry with thermal alert model"
    plan = engine.analyze_prompt_and_plan(prompt, tier="Pro")

    assert plan["session_id"].startswith("SES-")
    assert plan["tier"] == "Pro"
    assert len(plan["action_plan_steps"]) == 6
    assert plan["stage_status"] == "AWAITING_USER_CHOICE"

    # Verify Choice A: Manual Setup Package is present
    assert "cli_command" in plan["manual_package"]
    assert "yaml_manifest" in plan["manual_package"]
    assert "sabre-paas" in plan["manual_package"]["cli_command"]

def test_strict_2_task_micro_agent_capacity_and_safety_interlock():
    engine = SovereignAiHomegrownEngine()
    prompt = "Automate telemetry deployment with predictive brake models"
    plan = engine.analyze_prompt_and_plan(prompt, tier="Max")
    session_id = plan["session_id"]

    # Trigger Choice B: Let AI Configure
    swarm_res = engine.trigger_multi_agent_swarm(session_id)
    assert swarm_res["status"] == "SUCCESS"
    assert swarm_res["stage_status"] == "STAGED_READY_TO_ARM"
    assert "auth_token" in swarm_res

    # STRICT ASSERTION: Exactly 4 micro-agents, each with EXACTLY 2 tasks (No more, no less)
    traces = swarm_res["agent_chain_trace"]
    assert len(traces) == 4
    for agent_trace in traces:
        assert len(agent_trace["tasks"]) == 2, f"Agent {agent_trace['agent_name']} exceeded 2-task limit!"
        assert agent_trace["task_capacity"] == "2/2 MAX CAPACITY REACHED"
        assert agent_trace["status"] == "COMPLETED_STAGED"

    # Verify system is STAGED and NOT automatically powered on
    session = engine.get_session(session_id)
    assert session["stage_status"] == "STAGED_READY_TO_ARM"
    assert session["armed_at"] is None

    # Now verify explicit Human-in-the-loop Power-On Authorization
    auth_token = swarm_res["auth_token"]
    power_res = engine.arm_and_power_on(session_id, auth_token)
    assert power_res["status"] == "SUCCESS"
    assert power_res["stage_status"] == "POWERED_ON"

    # Verify session now active
    session_after = engine.get_session(session_id)
    assert session_after["stage_status"] == "POWERED_ON"
    assert session_after["armed_at"] is not None

def test_continuous_learning_dataset_store():
    engine = SovereignAiHomegrownEngine()
    samples = engine.get_recent_training_dataset(5)
    assert isinstance(samples, list)
    assert len(samples) > 0
    assert "user_prompt" in samples[0]
    assert "tier" in samples[0]
