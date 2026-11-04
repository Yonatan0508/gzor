#!/usr/bin/env bash
# Downloads Google's MediaPipe "magic touch" interactive segmentation model (~6 MB).
set -euo pipefail
mkdir -p models
curl -fL --retry 3 -o models/magic_touch.tflite \
  https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/1/magic_touch.tflite
ls -lh models/magic_touch.tflite
