import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  // Use __dirname for more reliable path resolution in ESM
  const root = __dirname;

  console.log(`[Server] Starting server...`);
  console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`[Server] Root Directory: ${root}`);

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: root
    });
    
    app.use(vite.middlewares);

    app.all("*", async (req, res, next) => {
      const url = req.originalUrl;
      
      // Serve index.html for all routes not handled by Vite middlewares (SPA fallback)
      if (url.includes(".") && !url.endsWith(".html")) {
        return next();
      }

      try {
        const templatePath = path.resolve(root, "index.html");
        if (!fs.existsSync(templatePath)) {
          return res.status(404).send("index.html not found.");
        }

        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.stack);
      }
    });
  } else {
    const distPath = path.resolve(root, "dist");
    app.use(express.static(distPath, { index: false }));

    app.get("*", (req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        const rootIndex = path.resolve(root, "index.html");
        if (fs.existsSync(rootIndex)) {
            res.sendFile(rootIndex);
        } else {
            res.status(404).send("Build artifacts not found.");
        }
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[Server] Startup error:", err);
  process.exit(1);
});
