const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'node_modules', 'tinymce', 'skins', 'ui', 'oxide');
const destDir = path.join(__dirname, '..', 'public', 'tinymce', 'skins', 'ui', 'oxide');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        if (err.code === 'EPERM') {
          // На всякий случай снимаем read-only и пробуем ещё раз
          try {
            fs.chmodSync(destPath, 0o666);
            fs.copyFileSync(srcPath, destPath);
          } catch (err2) {
            console.warn('Failed to copy (EPERM):', destPath, '-', err2.message);
          }
        } else {
          throw err;
        }
      }
    }
  }
}

if (!fs.existsSync(srcDir)) {
  console.warn('TinyMCE oxide skin not found at:', srcDir);
  process.exit(0);
}

// Очищаем целевую папку, чтобы не мешали старые файлы/права
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

copyDir(srcDir, destDir);
console.log('TinyMCE oxide skin copied to public/tinymce/skins/ui/oxide');

