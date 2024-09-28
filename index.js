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

if (!mongoUri) {
  console.error("MONGODB_URI ist nicht definiert");
  process.exit(1);
}

mongoose.connect(mongoUri);

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
      message: "Benutzer erfolgreich registriert",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error("Registrierungsfehler:", error);
    res.status(500).send("Fehler bei der Registrierung");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send("Ungültige Anmeldedaten");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Ungültige Anmeldedaten");
    }

    // Send back the userId (_id) to the frontend
    res
      .status(200)
      .json({ message: "Anmeldung erfolgreich", userId: user._id, name: user.name, email: user.email });
  } catch (error) {
    console.error("Login-Fehler:", error);
    res.status(500).send("Fehler bei der Anmeldung");
  }
});

app.post("/api/update-profile", async (req, res) => {
  try {
    const { userId, name, email } = req.body;

    if (!userId) {
      return res.status(400).send("Benutzer-ID fehlt oder ist ungültig");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Ungültige Benutzer-ID");
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.status(200).send("Benutzerprofil erfolgreich aktualisiert");
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Benutzerprofils:", error);
    res.status(500).send("Fehler beim Aktualisieren des Profils");
  }
});

app.get("/api/user/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Ungültige Benutzer-ID");
    }

    const user = await User.findById(userId, "name email"); // Select only name and email

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Fehler beim Abrufen des Benutzerprofils:", error);
    res.status(500).send("Fehler beim Abrufen des Profils");
  }
});


app.listen(3000, () => {
  console.log("Server läuft auf Port 3000");
});
