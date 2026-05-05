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
  
  // Initialize Bare Server with minimal options for stability
  const bareServer = createBareServer('/bare/', {
    maintainConnections: false,
    logErrors: true,
  });

  app.use(cors());

  // Production vs Development routing
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
      // Don't interfere with Bare Server requests
      if (req.path.startsWith('/bare/')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = createServer();

  // Route requests to Bare Server or Express App
  server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  // Route WebSocket upgrades to Bare Server
  server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else {
      socket.end();
    }
  });

  server.on('listening', () => {
    console.log(`Server is listening on port ${PORT}`);
  });

  server.listen(PORT, '0.0.0.0');
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

