import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[Server] Starting in ${process.env.NODE_ENV || 'development'} mode...`);

  // Middleware untuk parsing JSON
  app.use(express.json());

  // Log all requests
  app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
  });

  // API Health Check - Always first
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Integrasi Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Middleware Vite menangani aset statis (JS, CSS, Gambar)
    app.use(vite.middlewares);

    // Fallback SPA: Kirim index.html untuk semua rute navigasi
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      
      // Jika request adalah aset (ada titik di path tapi bukan .html), biarkan next()
      if (url.includes(".") && !url.endsWith(".html")) {
        return next();
      }

      try {
        // Gunakan path absolut ke index.html di root
        const templatePath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        
        // Transform template melalui Vite (untuk HMR dan inject scripts)
        template = await vite.transformIndexHtml(url, template);
        
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Mode Produksi
    const distPath = path.join(process.cwd(), "dist");
    
    app.use(express.static(distPath, { index: false }));
    
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Build production tidak ditemukan. Jalankan 'npm run build' terlebih dahulu.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[Server] Critical Failure:", err);
  process.exit(1);
});
