import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('./app/', import.meta.url));
const position = process.argv.indexOf('--port');
const port = position < 0 ? 8080 : Number(process.argv[position + 1]);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
createServer((request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    const file = resolve(appRoot, '.' + (path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(resolve(appRoot) + sep)) { response.writeHead(403).end('Forbidden'); return; }
    const stat = statSync(file);
    if (!stat.isFile()) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, { 'content-type': (types[extname(file)] || 'application/octet-stream') + '; charset=utf-8', 'content-length': stat.size, 'cache-control': 'no-store' });
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Serving app/ at http://localhost:${port}`));
