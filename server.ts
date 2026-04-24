import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const root = process.cwd();

  console.log(`[Server] Starting server...`);
  console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`[Server] Root Directory: ${root}`);

  app.use(express.json());

  // Always log requests to help debug 404s
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Dev mode: Starting Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      
      // If it looks like a file, let Vite handle it or fail
      if (url.includes('.') && !url.endsWith('.html')) {
        return next();
      }

      try {
        const templatePath = path.resolve(root, "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log("[Server] Production mode: Serving dist/");
    const distPath = path.resolve(root, "dist");
    
    // Serve static assets with a long cache
    app.use(express.static(distPath, {
      maxAge: '1d',
      index: false
    }));

    // For any other request, send index.html
    app.get("*", (req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[Server] Critical: index.html not found in dist/`);
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
