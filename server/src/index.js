import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import meRoutes from "./routes/meRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Locally stored item photos — the development fallback. In production,
// photos are served from Cloudinary URLs instead (config/cloudinary.js).
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "CampusKhoj API" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/me", meRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Multer upload errors (file too large, wrong type) as friendly 400s.
app.use((err, req, res, next) => {
  if (err && err.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ message: "Image must be smaller than 2 MB" });
  }
  return next(err);
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
