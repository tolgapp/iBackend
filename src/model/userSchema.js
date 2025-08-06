import mongoose from "mongoose";
import favoriteProductSchema from "./favoriteSchema.js"

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  favorites: [favoriteProductSchema],
});

export const User = mongoose.model("User", userSchema);