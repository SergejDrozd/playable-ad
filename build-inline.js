const fs = require('fs');
const path = require('path');

console.log('Building inline HTML with embedded assets...\n');

// Читаем скомпилированный bundle.js
const bundlePath = path.join(__dirname, 'public', 'bundle.js');
if (!fs.existsSync(bundlePath)) {
  console.error('Error: public/bundle.js not found. Run "npm run build" first.');
  process.exit(1);
}

const bundleJS = fs.readFileSync(bundlePath, 'utf8');
console.log('bundle.js loaded');

// Конвертируем все PNG-фреймы туториала в base64
const tutorialFrames = [];
const assetsDir = path.join(__dirname, 'public', 'assets', 'tutorial');

if (!fs.existsSync(assetsDir)) {
  console.error('Error: assets/tutorial directory not found at:', assetsDir);
  process.exit(1);
}

console.log('Converting tutorial frames to base64...');

for (let i = 1; i <= 94; i++) {
  const num = String(i).padStart(4, '0');
  const filename = `frame_${num}.png`;
  const filepath = path.join(assetsDir, filename);
  
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filename} not found, skipping...`);
    continue;
  }
  
  const fileData = fs.readFileSync(filepath);
  const base64 = fileData.toString('base64');
  tutorialFrames.push({
    name: `frame_${num}`,
    data: `data:image/png;base64,${base64}`
  });
}

console.log(`Converted ${tutorialFrames.length} frames\n`);

// Создаём финальный HTML
const finalHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Playable</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
    #game-container {
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="game-container"></div>

  <!-- Win/Lose overlays -->
  <div id="win-overlay" style="
    position:absolute; inset:0; display:none; align-items:center; justify-content:center;
    flex-direction:column; background:rgba(0,0,0,0.6); color:white; font-family:sans-serif;">
    <h1>You Win!</h1>
    <button>Next</button>
  </div>

  <div id="lose-overlay" style="
    position:absolute; inset:0; display:none; align-items:center; justify-content:center;
    flex-direction:column; background:rgba(0,0,0,0.6); color:white; font-family:sans-serif;">
    <h1>You Lose</h1>
    <button>Retry</button>
  </div>

  <script>
    // Встроенные ассеты (base64)
    const INLINE_ASSETS = ${JSON.stringify(tutorialFrames, null, 2)};
  </script>
  
  <script>
    // Bundle с игрой (регистрация ассетов происходит внутри main.ts)
    ${bundleJS}
  </script>
</body>
</html>
`;

// Создаём папку dist, если её нет
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Записываем финальный HTML
const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, finalHTML, 'utf8');

// Проверяем размер файла
const stats = fs.statSync(outputPath);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('Final HTML created:', outputPath);
console.log(`File size: ${fileSizeMB} MB`);

if (stats.size > 5 * 1024 * 1024) {
  console.warn('WARNING: File size exceeds 5MB limit!');
} else {
  console.log('File size is within 5MB limit\n');
}

console.log('Build complete!\n');