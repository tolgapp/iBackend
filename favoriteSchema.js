import mongoose from "mongoose";

const favoriteProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: String,
  addedDate: { type: Date, default: Date.now },
});

export default favoriteProductSchema;