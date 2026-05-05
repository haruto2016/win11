import express from "express";
import { createServer as createViteServer } from "vite";
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  const bareServer = createBareServer('/bare/');

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
    // IMPORTANT: The wildcard catch-all must NOT intercept /bare/ requests.
    // Bare server is handled at the HTTP server level (below), so this
    // catch-all will only fire for non-bare requests.
    app.get('*', (req, res, next) => {
      // Let /bare/ requests fall through to the raw HTTP handler
      if (req.path.startsWith('/bare/')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = createServer();

  // Handle ALL HTTP requests: route /bare/ to Bare server, rest to Express
  server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  // Handle WebSocket upgrades for Bare server (needed for sites like YouTube)
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
