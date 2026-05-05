import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const srcDir = path.dirname(require.resolve('@titaniumnetwork-dev/ultraviolet/package.json')) + '/dist';
const destDir = path.join(process.cwd(), 'public', 'uv');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(srcDir).forEach(file => {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
});

// Overwrite uv.config.js
const configBody = `self.__uv$config = {
    prefix: '/uv/service/',
    bare: '/bare/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    client: '/uv/uv.client.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};`;
fs.writeFileSync(path.join(destDir, 'uv.config.js'), configBody);

const swBody = `importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts('/uv/uv.sw.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', event => {
    event.respondWith(
        sw.fetch(event)
    );
});`;
fs.writeFileSync(path.join(process.cwd(), 'public', 'sw.js'), swBody);

console.log('UV files copied successfully!');
