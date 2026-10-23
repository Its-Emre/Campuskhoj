import Item from "../models/Item.js";
import Claim from "../models/Claim.js";

// POST /api/items/:id/claims — protected.
// A logged-in user (not the poster) requests to claim an open item.
export const createClaim = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.postedBy.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot claim your own post" });
    }

    if (item.status !== "open") {
      return res
        .status(400)
        .json({ message: "This item is no longer open for claims" });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please tell the poster how you can prove it is yours",
      });
    }

    // One active claim record per (item, user) pair.
    const existing = await Claim.findOne({
      item: item._id,
      claimer: req.user._id,
    });

    if (existing && existing.status === "pending") {
      return res
        .status(400)
        .json({ message: "You already have a pending claim on this item" });
    }
    if (existing && existing.status === "accepted") {
      return res
        .status(400)
        .json({ message: "Your claim on this item was already accepted" });
    }

    if (existing) {
      // A declined claim can be submitted again with a fresh message.
      existing.message = message.trim();
      existing.status = "pending";
      await existing.save();
      const populated = await existing.populate("claimer", "name email");
      return res.json(populated);
    }

    const claim = await Claim.create({
      item: item._id,
      claimer: req.user._id,
      message: message.trim(),
    });
    const populated = await claim.populate("claimer", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/items/:id/claims — protected, poster only.
export const getItemClaims = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the poster can view claim requests" });
    }

    const claims = await Claim.find({ item: item._id })
      .populate("claimer", "name email")
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH /api/items/:id/claims/:claimId — protected, poster only.
// Body: { decision: "accepted" | "declined" }
export const respondClaim = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the poster can respond to claims" });
    }

    const claim = await Claim.findById(req.params.claimId);
    if (!claim || claim.item.toString() !== item._id.toString()) {
      return res.status(404).json({ message: "Claim not found" });
    }
    if (claim.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This claim was already answered" });
    }

    const { decision } = req.body;

    if (decision === "accepted") {
      if (item.status !== "open") {
        return res
          .status(400)
          .json({ message: "This item is no longer open" });
      }
      claim.status = "accepted";
      await claim.save();
      item.status = "claimed";
      await item.save();
      // One accepted claim ends the hunt — decline every other pending claim.
      await Claim.updateMany(
        { item: item._id, status: "pending", _id: { $ne: claim._id } },
        { $set: { status: "declined" } }
      );
    } else if (decision === "declined") {
      claim.status = "declined";
      await claim.save();
    } else {
      return res
        .status(400)
        .json({ message: "Decision must be accepted or declined" });
    }

    const populated = await claim.populate("claimer", "name email");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/me/items — protected. Items posted by the logged-in user,
// each with its pending-claim count for the dashboard.
export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
    });

    const withCounts = await Promise.all(
      items.map(async (item) => {
        const pendingClaims = await Claim.countDocuments({
          item: item._id,
          status: "pending",
        });
        return { ...item.toObject(), pendingClaims };
      })
    );

    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/me/claims — protected. Claims made by the logged-in user.
// Optional query ?item=<id> filters to one item (used on the detail page).
export const getMyClaims = async (req, res) => {
  try {
    const filter = { claimer: req.user._id };
    if (req.query.item) filter.item = req.query.item;

    const claims = await Claim.find(filter)
      .populate("item", "title imageUrl status type")
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
