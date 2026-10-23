import express from "express";
import {
  getItems,
  getItemById,
  createItem,
  updateItemStatus,
  deleteItem,
} from "../controllers/itemController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getItems);
router.get("/:id", getItemById);
// Multipart upload: single image under the "image" field.
router.post("/", protect, upload.single("image"), createItem);
router.patch("/:id/status", protect, updateItemStatus);
router.delete("/:id", protect, deleteItem);

export default router;
