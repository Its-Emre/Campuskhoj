import express from "express";
import {
  getItems,
  getItemById,
  createItem,
  updateItemStatus,
  deleteItem,
} from "../controllers/itemController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getItems);
router.get("/:id", getItemById);
router.post("/", protect, createItem);
router.patch("/:id/status", protect, updateItemStatus);
router.delete("/:id", protect, deleteItem);

export default router;
