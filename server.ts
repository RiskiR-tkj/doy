import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const root = process.cwd();

  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.resolve(root, "dist"));
  
  console.log(`[Server] Starting server...`);
  console.log(`[Server] Detected Environment: ${isProd ? "production" : "development"}`);
  console.log(`[Server] Root Directory: ${root}`);

  app.use(express.json());

  // Favicon fallback
  app.get('/favicon.ico', (req, res) => res.status(204).end());

  // Always log requests to help debug
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: isProd ? "production" : "development" });
  });

  if (!isProd) {
    console.log("[Server] Development mode: Starting Vite middleware...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      
      app.get("*", async (req, res, next) => {
        const url = req.originalUrl;
        
        // If it looks like a file (has an extension) and Vite middleware didn't catch it, let it pass
        if (url.includes('.') && !url.endsWith('.html')) {
          return next();
        }

        try {
          const templatePath = path.resolve(root, "index.html");
          if (!fs.existsSync(templatePath)) {
            return next();
          }
          let template = fs.readFileSync(templatePath, "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
    } catch (viteError) {
      console.error("[Server] Failed to start Vite:", viteError);
      app.get("*", (req, res) => {
        res.status(500).send("Vite failed to start. Check server logs.");
      });
    }
  } else {
    console.log("[Server] Production mode: Serving dist/ folder");
    const distPath = path.resolve(root, "dist");
    
    // Serve static assets
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
        const rootIndex = path.resolve(root, "index.html");
        if (fs.existsSync(rootIndex)) {
            res.sendFile(rootIndex);
        } else {
            res.status(404).send("Application files missing. Please build the app.");
        }
      }
    });
  }

  // Final catch-all for anything not handled by Vite or static or SPA fallback
  app.use((req, res) => {
    console.warn(`[Server] 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).send(`404: The route ${req.url} was not found on this server.`);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[Server] Critical startup error:", err);
  process.exit(1);
});
