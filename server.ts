import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";

const app = express();
const PORT = 3000;

// Spawn Django Backend on Port 8000
console.log("[MemoryCraft] Spawning Django Backend on Port 8000...");
const djangoProcess = spawn("python3", ["backend/manage.py", "runserver", "127.0.0.1:8000"], {
  stdio: "inherit",
});

djangoProcess.on("error", (err) => {
  console.error("[MemoryCraft] Failed to start Django backend process:", err);
});

// Ensure Django process is killed when Node exits
process.on("exit", () => {
  djangoProcess.kill();
});
process.on("SIGINT", () => {
  djangoProcess.kill();
  process.exit();
});
process.on("SIGTERM", () => {
  djangoProcess.kill();
  process.exit();
});

// Proxy /api/ requests to Django Backend
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:8000",
    changeOrigin: true,
  })
);

// Proxy Django Admin panel requests to Django Backend
app.use(
  "/admin",
  createProxyMiddleware({
    target: "http://127.0.0.1:8000",
    changeOrigin: true,
  })
);

// Proxy media files to Django Backend
app.use(
  "/media",
  createProxyMiddleware({
    target: "http://127.0.0.1:8000",
    changeOrigin: true,
  })
);

// Vite Middleware & SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

