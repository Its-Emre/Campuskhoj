import express from "express";
import { getMyItems, getMyClaims } from "../controllers/claimController.js";
import { protect } from "../middleware/authMiddleware.js";

// Personal dashboard data for the logged-in user.
const router = express.Router();

router.get("/items", protect, getMyItems);
router.get("/claims", protect, getMyClaims);

export default router;
