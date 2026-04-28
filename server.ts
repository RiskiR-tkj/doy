import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const root = process.cwd();

  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.resolve(root, "dist/index.html"));
  
  console.log(`[Server] Starting server...`);
  console.log(`[Server] Detected Environment: ${isProd ? "production" : "development"}`);
  console.log(`[Server] Root Directory: ${root}`);

  app.use(express.json());

  // Always log requests to help debug
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Favicon fallback
  app.get('/favicon.ico', (req, res) => res.status(204).end());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: isProd ? "production" : "development" });
  });

  if (!isProd) {
    console.log("[Server] Development mode: Starting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    
    // Explicit SPA fallback for dev if Vite middleware misses it
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.includes('.') && !url.endsWith('.html')) {
        return next();
      }
      try {
        const templatePath = path.resolve(root, "index.html");
        if (!fs.existsSync(templatePath)) return next();
        
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    console.log("[Server] Production mode: Serving dist/ folder");
    const distPath = path.resolve(root, "dist");
    
    // Serve static assets
    app.use(express.static(distPath, {
      index: false
    }));

    // SPA Fallback
    app.get("*", (req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application files missing. Please rebuild.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[Server] Critical startup error:", err);
  process.exit(1);
});
