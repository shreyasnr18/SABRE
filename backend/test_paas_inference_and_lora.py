import pytest
import os
from paas_local_inference_worker import local_inference_worker
from train_lora_adapter import lora_pipeline

def test_phase_1_local_inference_worker():
    workers = local_inference_worker.list_all_workers()
    assert len(workers) == 3
    assert "Normal" in workers
    assert "Pro" in workers
    assert "Max" in workers

    # Test generation on Pro tier
    res = local_inference_worker.generate_completion(
        tier="Pro",
        prompt="Configure high-frequency telematics pipeline",
        max_tokens=256
    )
    assert res["status"] == "SUCCESS"
    assert res["tier"] == "Pro"
    assert res["prompt_tokens"] > 5
    assert res["completion_tokens"] > 50
    assert "llama" in res["base_model"].lower()
    assert res["latency_ms"] > 0
    assert res["tokens_per_second"] > 0

def test_phase_2_lora_training_pipeline():
    # Trigger LoRA training job
    job = lora_pipeline.start_training_job(
        tier="Normal",
        epochs=2,
        learning_rate=2e-4,
        lora_rank=16
    )

    assert job["status"] == "COMPLETED"
    assert job["tier"] == "Normal"
    assert job["base_model"] == "Mistral-7B-Instruct-v0.3"
    assert job["final_loss"] < job["initial_loss"]
    assert job["progress_pct"] == 100

    # Verify adapter metadata file and weights exist
    adapter_path = job["adapter_path"]
    assert os.path.exists(adapter_path)
    assert os.path.exists(os.path.join(adapter_path, "adapter_config.json"))
    assert os.path.exists(os.path.join(adapter_path, "adapter_model.safetensors"))

    # Test retrieving job status
    fetched_job = lora_pipeline.get_job_status(job["job_id"])
    assert fetched_job is not None
    assert fetched_job["job_id"] == job["job_id"]
