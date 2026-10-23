import express from "express";
import {
  getItems,
  getItemById,
  createItem,
  updateItemStatus,
  deleteItem,
} from "../controllers/itemController.js";
import {
  createClaim,
  getItemClaims,
  respondClaim,
} from "../controllers/claimController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getItems);
router.get("/:id", getItemById);
// Multipart upload: single image under the "image" field.
router.post("/", protect, upload.single("image"), createItem);
router.patch("/:id/status", protect, updateItemStatus);
router.delete("/:id", protect, deleteItem);

// Claim flow: anyone logged in (except the poster) can claim an open item;
// the poster reviews the requests and accepts at most one.
router.post("/:id/claims", protect, createClaim);
router.get("/:id/claims", protect, getItemClaims);
router.patch("/:id/claims/:claimId", protect, respondClaim);

export default router;
