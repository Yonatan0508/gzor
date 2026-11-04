// Builds www/ for the Android app: wraps src/index.html in a full page and copies MediaPipe.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const www = path.join(root, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, 'mediapipe/wasm'), { recursive: true });
fs.mkdirSync(path.join(www, 'models'), { recursive: true });

const body = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
const page = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#2D5A4C">
<style>
:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
img{max-width:100%}
[hidden]{display:none!important}
</style>
</head>
<body>
${body}
</body>
</html>
`;
fs.writeFileSync(path.join(www, 'index.html'), page);

const mp = path.join(root, 'node_modules/@mediapipe/tasks-vision');
fs.copyFileSync(path.join(mp, 'vision_bundle.mjs'), path.join(www, 'mediapipe/vision_bundle.mjs'));
for (const f of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm'])
  fs.copyFileSync(path.join(mp, 'wasm', f), path.join(www, 'mediapipe/wasm', f));

// The AI model is downloaded by the build (scripts/get-model.sh). If it is missing,
// the app downloads it from Google the first time it runs.
const model = path.join(root, 'models/magic_touch.tflite');
if (fs.existsSync(model)) fs.copyFileSync(model, path.join(www, 'models/magic_touch.tflite'));
else console.warn('models/magic_touch.tflite not found: the app will fetch the model online on first run');
console.log('www ready');
