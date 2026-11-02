// Общие функции для теста и экспорта: статический сервер и запуск Chrome.
import http from 'http'; import fs from 'fs'; import path from 'path';
import { createRequire } from 'module';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };

export function serve(root, port) {
  const srv = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(p, (e, d) => {
      if (e) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); res.end(d);
    });
  });
  return new Promise((ok) => srv.listen(port, () => ok(srv)));
}

// Путь к puppeteer-core задаётся переменной PUPPETEER_DIR (папка с node_modules).
export async function browser() {
  const req = createRequire(path.join(process.env.PUPPETEER_DIR, 'x.js'));
  const pp = req('puppeteer-core');
  return pp.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--force-color-profile=srgb'] });
}
