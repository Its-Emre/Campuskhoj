import Item from "../models/Item.js";

// GET /api/items — public. Supports ?search=&type=&category=&location=
export const getItems = async (req, res) => {
  try {
    const { search, type, category, location } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Item.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/items/:id — public
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "postedBy",
      "name email"
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/items — protected. Accepts multipart form data with an
// optional single "image" file (see middleware/upload.js).
export const createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, date } = req.body;

    if (!title || !description || !type || !location || !date) {
      return res.status(400).json({
        message: "Title, description, type, location and date are required",
      });
    }

    const item = await Item.create({
      title,
      description,
      type,
      category,
      location,
      date,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      postedBy: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH /api/items/:id/status — protected, owner only
export const updateItemStatus = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own posts" });
    }

    const { status } = req.body;
    if (!["open", "claimed", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    item.status = status;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/items/:id — protected, owner only
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
