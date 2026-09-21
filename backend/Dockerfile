# ── RetinaRetail Backend — Minimal Production Dockerfile ──────────────────────
# Uses python:3.11-slim + opencv-python-headless (no display required)
# Optimized for free-tier Render deployment: lean image, fast cold start

FROM python:3.11-slim

# Env: don't buffer stdout, skip .pyc writes, faster pip
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# ── System dependencies needed by opencv-python-headless ────────────────────
# libglib2.0-0  — GLib, needed by OpenCV
# libgomp1      — OpenMP, needed by ultralytics/ONNX
# libgl1        — OpenGL stub, required by some cv2 builds even headless
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libglib2.0-0 \
        libgomp1 \
        libgl1 \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ──────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# ── Pre-download YOLO model weight during build (not at cold-start) ──────────
# Ultralytics auto-downloads yolov8n.pt (~6 MB) on first YOLO() call.
# Running it here bakes it into the image layer so cold starts are instant.
# The model is cached to ~/.config/ultralytics/ inside the image.
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

# ── Application source ───────────────────────────────────────────────────────
COPY . .

# ── Expose & run ─────────────────────────────────────────────────────────────
EXPOSE 8000

# Single worker — free-tier has 512 MB RAM; ultralytics model fits one replica
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
