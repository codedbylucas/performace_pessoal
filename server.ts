import { createServer as createViteServer } from "vite";
import express from "express";
import path from "path";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT || 8787);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

startServer();
