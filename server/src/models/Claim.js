import mongoose from "mongoose";

// A claim is a request from a logged-in user (not the poster) to take an
// open item back. The poster reviews claims on the item detail page and
// can accept exactly one, which marks the item as claimed.
const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Proof of ownership: e.g. "It has a blue sticker on the back" or
    // "The ID number on the card is X". Shown to the poster only.
    message: { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);

export default Claim;
