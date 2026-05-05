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

// Configure global agents for high performance and to avoid IP blocks.
// We use a high number of sockets and a short timeout to prevent stale connections
// from piling up on Railway's shared infrastructure.
const agentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: Infinity,
  maxFreeSockets: 256,
  timeout: 60000,
};

http.globalAgent = new http.Agent(agentOptions);
https.globalAgent = new https.Agent(agentOptions);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // maintainConnections: false is crucial for serverless/shared-IP hosting
  // as it prevents the proxy from trying to manage a persistent connection pool
  // which often triggers CONNECTION_LIMIT_EXCEEDED on upstream sites.
  const bareServer = createBareServer('/bare/', {
    maintainConnections: false,
    logErrors: true,
  });

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

  // Handle ALL HTTP requests
  server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  // Handle WebSocket upgrades
  server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else {
      socket.destroy();
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Bare server active at /bare/`);
  });
}

startServer();

