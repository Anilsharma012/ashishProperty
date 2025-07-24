import express from "express";
import cors from "cors";
import { connectToDatabase, getDatabase } from "./db/mongodb";
// ... (baaki imports same)

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
    ],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    console.log("✅ MongoDB Atlas connected successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
  });

// All routes register below
// ... (jaise ki app.get("/api/properties", ...), etc...)

// Finally start the server
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
