"""Training Service — LoRA fine-tuning on user images/videos for personalized generation."""

import time
import logging
import json
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class Trainer:
    """LoRA fine-tuning for personalized image/video generation."""

    def __init__(self, storage: str = "storage/training"):
        self.storage = Path(storage)
        self.storage.mkdir(parents=True, exist_ok=True)
        (self.storage / "datasets").mkdir(exist_ok=True)
        (self.storage / "models").mkdir(exist_ok=True)
        self._device = None
        self._jobs: dict = {}
        self._init_device()
        logger.info(f"Trainer ready — device: {self._device}")

    def _init_device(self):
        try:
            import torch

            self._device = "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            self._device = "cpu"

    def upload_data(
        self, files: list[tuple[str, bytes]], dataset: str = "default"
    ) -> dict:
        """Upload training images/videos to a dataset."""
        from PIL import Image
        import io

        ds_path = self.storage / "datasets" / dataset
        ds_path.mkdir(parents=True, exist_ok=True)

        saved = []
        for filename, data in files:
            ext = Path(filename).suffix.lower()
            if ext in (".png", ".jpg", ".jpeg", ".webp", ".bmp"):
                img = Image.open(io.BytesIO(data)).convert("RGB")
                out = ds_path / filename
                img.save(out)
                saved.append(str(out))
            elif ext in (".mp4", ".avi", ".mov", ".webm"):
                out = ds_path / filename
                out.write_bytes(data)
                saved.append(str(out))
            else:
                logger.warning(f"Skipped unsupported file: {filename}")

        logger.info(f"Uploaded {len(saved)} files to dataset '{dataset}'")
        return {"dataset": dataset, "files": saved, "count": len(saved)}

    def start(
        self,
        dataset: str = "default",
        name: str = "my_lora",
        base_model: str = "stabilityai/stable-diffusion-xl-base-1.0",
        trigger_word: str = "astra_subject",
        steps: int = 500,
        lr: float = 1e-4,
        rank: int = 4,
    ) -> dict:
        """Start LoRA fine-tuning. Returns job info."""
        ds_path = self.storage / "datasets" / dataset
        if not ds_path.exists():
            raise ValueError(f"Dataset '{dataset}' not found. Upload images first.")

        images = (
            list(ds_path.glob("*.png"))
            + list(ds_path.glob("*.jpg"))
            + list(ds_path.glob("*.jpeg"))
        )
        if len(images) < 3:
            raise ValueError(
                f"Need at least 3 images for training, found {len(images)}"
            )

        job_id = f"job_{int(time.time())}"
        output_dir = self.storage / "models" / name

        job = {
            "id": job_id,
            "name": name,
            "dataset": dataset,
            "base_model": base_model,
            "trigger_word": trigger_word,
            "steps": steps,
            "lr": lr,
            "rank": rank,
            "image_count": len(images),
            "status": "starting",
            "started_at": time.time(),
            "output_dir": str(output_dir),
            "progress": 0,
        }
        self._jobs[job_id] = job

        import threading

        thread = threading.Thread(target=self._train, args=(job, images), daemon=True)
        thread.start()

        logger.info(f"Training started: {job_id} — {len(images)} images, {steps} steps")
        return job

    def _train(self, job: dict, images: list):
        """Run the actual LoRA training in background thread."""
        try:
            import torch
            from PIL import Image as PILImage
            from diffusers import StableDiffusionXLPipeline
            from peft import LoraConfig, get_peft_model

            job["status"] = "loading_model"
            dtype = torch.float16 if self._device == "cuda" else torch.float32
            pipe = StableDiffusionXLPipeline.from_pretrained(
                job["base_model"], torch_dtype=dtype
            )
            pipe = pipe.to(self._device)

            lora_config = LoraConfig(
                r=job["rank"],
                lora_alpha=job["rank"],
                target_modules=["to_k", "to_q", "to_v", "to_out.0"],
                lora_dropout=0.0,
            )

            unet = get_peft_model(pipe.unet, lora_config)
            optimizer = torch.optim.AdamW(unet.parameters(), lr=job["lr"])

            job["status"] = "training"

            # Training loop
            from torchvision import transforms

            transform = transforms.Compose(
                [
                    transforms.Resize((512, 512)),
                    transforms.ToTensor(),
                    transforms.Normalize([0.5], [0.5]),
                ]
            )

            for step in range(job["steps"]):
                img_path = images[step % len(images)]
                img = PILImage.open(img_path).convert("RGB")
                pixel_values = transform(img).unsqueeze(0).to(self._device, dtype=dtype)

                with torch.no_grad():
                    latents = (
                        pipe.vae.encode(pixel_values).latent_dist.sample()
                        * pipe.vae.config.scaling_factor
                    )
                    noise = torch.randn_like(latents)
                    timesteps = torch.randint(0, 1000, (1,), device=self._device).long()
                    noisy = pipe.scheduler.add_noise(latents, noise, timesteps)

                text_inputs = pipe.tokenizer(
                    job["trigger_word"],
                    return_tensors="pt",
                    padding="max_length",
                    max_length=77,
                    truncation=True,
                ).to(self._device)
                text_embeds = pipe.text_encoder(text_inputs.input_ids)[0]

                noise_pred = unet(
                    noisy, timesteps, encoder_hidden_states=text_embeds
                ).sample
                loss = torch.nn.functional.mse_loss(noise_pred, noise)

                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                job["progress"] = int((step + 1) / job["steps"] * 100)
                if (step + 1) % 50 == 0:
                    logger.info(
                        f"Training {job['id']}: step {step+1}/{job['steps']}, loss: {loss.item():.4f}"
                    )

            # Save LoRA weights
            output_dir = Path(job["output_dir"])
            output_dir.mkdir(parents=True, exist_ok=True)
            unet.save_pretrained(output_dir)

            meta = {
                "name": job["name"],
                "trigger_word": job["trigger_word"],
                "base_model": job["base_model"],
                "steps": job["steps"],
                "rank": job["rank"],
            }
            (output_dir / "meta.json").write_text(json.dumps(meta, indent=2))

            job["status"] = "completed"
            job["completed_at"] = time.time()
            logger.info(f"Training completed: {job['id']} → {output_dir}")

        except Exception as e:
            job["status"] = "failed"
            job["error"] = str(e)
            logger.error(f"Training failed: {job['id']} — {e}")

    def status(self, job_id: str) -> Optional[dict]:
        """Get training job status."""
        return self._jobs.get(job_id)

    def list_jobs(self) -> list[dict]:
        """List all training jobs."""
        return list(self._jobs.values())

    def list_models(self) -> list[dict]:
        """List trained LoRA models."""
        models_dir = self.storage / "models"
        models = []
        for d in models_dir.iterdir():
            if d.is_dir():
                meta_file = d / "meta.json"
                if meta_file.exists():
                    meta = json.loads(meta_file.read_text())
                    meta["path"] = str(d)
                    models.append(meta)
                else:
                    models.append({"name": d.name, "path": str(d)})
        return models

    def info(self) -> dict:
        return {
            "device": self._device,
            "active_jobs": len(
                [
                    j
                    for j in self._jobs.values()
                    if j["status"] in ("starting", "loading_model", "training")
                ]
            ),
            "completed_jobs": len(
                [j for j in self._jobs.values() if j["status"] == "completed"]
            ),
            "models": len(self.list_models()),
        }


# Lazy singleton
_service = None


def get_trainer() -> Trainer:
    global _service
    if _service is None:
        _service = Trainer()
    return _service
