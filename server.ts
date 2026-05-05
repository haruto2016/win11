import express from "express";
import { createServer as createViteServer } from "vite";
import cors from 'cors';
import path from 'path';
import http, { createServer } from 'http';
import https from 'https';
import { createBareServer } from '@tomphttp/bare-server-node';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable keep-alive globally to prevent CONNECTION_LIMIT_EXCEEDED from YouTube/Google.
// Railway shares IPs between services, so too many persistent connections from one IP
// causes upstream servers to reject with TooManyConnections error.
http.globalAgent = new http.Agent({
  keepAlive: false,
  maxSockets: 64,
  timeout: 30000,
});
https.globalAgent = new https.Agent({
  keepAlive: false,
  maxSockets: 64,
  timeout: 30000,
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // maintainConnections: false prevents the Bare server from pooling
  // persistent connections to upstream hosts (key fix for shared-IP hosting).
  const bareServer = createBareServer('/bare/', {
    maintainConnections: false,
    logErrors: false,
  } as any);

  app.use(cors());

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/bare/')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = createServer();

  // Handle ALL HTTP requests: route /bare/ to Bare server, rest to Express
  server.on('request', (req, res) => {
    // Railway acts as a reverse proxy. To prevent the Bare Server from seeing all requests
    // as coming from the same internal proxy IP (which triggers CONNECTION_LIMIT_EXCEEDED),
    // we trick the bare server by giving each request a unique fake IP.
    // YouTube opens dozens of simultaneous connections, which easily triggers the limit
    // even if the true client IP is used. This bypasses the connection limit entirely.
    const fakeIp = `127.0.0.${Math.floor(Math.random() * 255)}`;
    Object.defineProperty(req.socket, 'remoteAddress', {
      get: () => fakeIp,
      configurable: true
    });

    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  // Handle WebSocket upgrades for Bare server
  server.on('upgrade', (req, socket, head) => {
    const fakeIp = `127.0.0.${Math.floor(Math.random() * 255)}`;
    Object.defineProperty(socket, 'remoteAddress', {
      get: () => fakeIp,
      configurable: true
    });

    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else {
      socket.destroy();
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Bare server active at /bare/ [keep-alive disabled]`);
  });
}

startServer();

