import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Setup for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();
const port = process.env.PORT || 3000;

// ✅ Serve frontend from compiled Vite build
const spaPath = path.resolve(__dirname, "../../spa");
app.use(express.static(spaPath));

// ✅ React Router fallback (client-side routing)
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(spaPath, "index.html"));
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
