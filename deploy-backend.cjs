const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, 'backend-laravel.zip'));
const archive = new ZipArchive({ zlib: { level: 9 } });

const ignore = ['node_modules/**', 'tests/**', '.git/**', '.gitignore', 'README.md'];

output.on('close', () => {
  const mb = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`\n✅ backend-laravel.zip creado (${mb} MB)`);
});

archive.on('error', (err) => { throw err; });
archive.pipe(output);

archive.glob('**/*', {
  cwd: path.join(__dirname, 'backend-laravel'),
  ignore: ignore,
  dot: true
});

archive.finalize();
