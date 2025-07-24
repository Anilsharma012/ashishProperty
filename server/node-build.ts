import path from "path";
import { createServer } from "./index";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createServer();
const port = process.env.PORT || 3000;

// FIX: Correct static file path
const distPath = path.resolve(__dirname, "../../spa");

// Serve static files
app.use(express.static(distPath));

// React Router fallback
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
