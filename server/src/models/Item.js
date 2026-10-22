import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["lost", "found"], required: true },
    category: {
      type: String,
      enum: [
        "electronics",
        "id-card",
        "keys",
        "clothing",
        "books",
        "accessories",
        "other",
      ],
      default: "other",
    },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["open", "claimed", "resolved"],
      default: "open",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
