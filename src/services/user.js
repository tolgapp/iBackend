import { User } from "../model/userSchema.js";
import mongoose from "mongoose";

export const profileUpdate = async (req, res) => {
  try {
    const { userId, name, email } = req.body;

    if (!userId) {
      return res.status(400).send("User ID is missing or invalid");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.status(200).send("User profile successfully updated");
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("Error updating profile");
  }
}

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const user = await User.findById(userId, "name email");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Error fetching profile");
  }
}