import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import { User } from "./userSchema.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const mongoUri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.FRONTEND_LINK.split(',');

if (!mongoUri) {
  console.error("MONGODB_URI is not defined");
  process.exit(1);
}

mongoose.connect(mongoUri);

app.use(cors({
  origin: allowedOrigins, 
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExist = await User.exists({ email });

    if (userExist) {
      return res.status(400).send({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User successfully registered",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Error during registration");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send("Invalid login credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid login credentials");
    }

    res
      .status(200)
      .json({ message: "Login successful", userId: user._id, name: user.name, email: user.email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Error during login");
  }
});

app.post("/api/update-profile", async (req, res) => {
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
});

app.get("/api/user/profile/:userId", async (req, res) => {
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
});

console.log("Server is starting on port:", process.env.PORT);
console.log("Allowed Origins:", allowedOrigins);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
