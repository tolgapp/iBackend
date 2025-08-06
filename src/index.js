import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getProducts } from "./services/products.js";
import { login, signup } from "./services/auth.js";
import { getUserData, profileUpdate } from "./services/user.js";
dotenv.config();

// TODO: controllers, services, routes, middlewares & utils directory structure
// TODO: controllers (authController, productController, userController)
// TODO: services (authService, productService, userService)


const app = express();
app.use(express.json());
app.use(cors());

const mongoUri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.FRONTEND_LINK.split(",");

if (!mongoUri) {
  console.error("MONGODB_URI is not defined");
  process.exit(1);
}

mongoose.connect(mongoUri);

app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.get("/", (req, res) => {
  res.send(`<h1>Backend listening..</h1>`);
});

app.get("/products", getProducts);

app.post("/api/signup", signup);
app.post("/api/login", login);

app.post("/api/update-profile", profileUpdate);
app.get("/api/user/profile/:userId", getUserData);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
