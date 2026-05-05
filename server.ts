import express from "express";
import { createServer as createViteServer } from "vite";
import cors from 'cors';
import path from 'path';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  // Initialize Bare Server
  const bareServer = createBareServer('/bare/', {
    maintainConnections: false,
    logErrors: true,
  });

  // CRITICAL FIX: The Bare Server has an internal connection limit of 10 per IP.
  // In Railway, all requests appear to come from the same internal proxy IP.
  // This hack replaces the internal tracking Map with a dummy that always says 0 connections.
  (bareServer as any).connections = new Map();
  const originalGet = Map.prototype.get;
  (bareServer as any).connections.get = function() { return []; }; 

  app.use(cors());

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/bare/')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = createServer();

  server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else {
      socket.end();
    }
  });

  server.on('listening', () => {
    console.log(`Server listening on port ${PORT}`);
  });

  server.listen(PORT, '0.0.0.0');
}

startServer().catch(console.error);

