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
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Entering Development mode with Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      
      // If the request has an extension (and isn't .html), let it fall through to next middleware
      // In dev mode, Vite middleware should have caught it if it existed.
      if (url.includes(".") && !url.endsWith(".html")) {
        return next();
      }

      try {
        const templatePath = path.resolve(root, "index.html");
        if (!fs.existsSync(templatePath)) {
          console.error(`[Server] index.html not found at ${templatePath}`);
          return res.status(404).send("index.html not found. Check root directory.");
        }

        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        console.error(`[Server] Error processing index.html:`, e);
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.stack);
      }
    });
  } else {
    console.log("[Server] Entering Production mode");
    const distPath = path.resolve(root, "dist");
    
    // Serve static files from dist
    app.use(express.static(distPath, { index: false }));

    // SPA Fallback for all other routes
    app.get("*", (req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.warn(`[Server] Production index.html not found at ${indexPath}. Falling back to root index.html.`);
        const rootIndex = path.resolve(root, "index.html");
        if (fs.existsSync(rootIndex)) {
            res.sendFile(rootIndex);
        } else {
            res.status(404).send("Build artifacts not found. Please run 'npm run build'.");
        }
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
