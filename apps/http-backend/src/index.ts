import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { middleware } from "./middleware";
import {JWT_SECRET} from "@repo/backend-common/config"
import { SignupSchema, SigninSchema } from "@repo/common/types";

const app = express();
app.use(express.json());

// temporary in-memory store (replace with DB later)
const users: {
  id: number;
  email: string;
  password: string;
}[] = [];

let userIdCounter = 1;

/* ================= SIGNUP ================= */
app.post("/signup", async (req, res) => {
    //take credential
  const parsed = SignupSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }
  const { email, password } = parsed.data;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  //check if exist
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }
  //if not exist hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  //push to DB
  users.push({
    id: userIdCounter++,
    email,
    password: hashedPassword,
  });

  res.json({ message: "Signup successful" });
});

/* ================= SIGNIN ================= */
app.post("/signin", async (req, res) => {
    //take credential
  const parsed = SigninSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }
  const { email, password } = parsed.data;
    if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  //search for the user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  //validate the passward
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  //generate token
  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/* ================= PROTECTED ROUTE ================= */
app.post("/room", middleware, (req, res) => {
  res.json({
    message: "Room created successfully",
    userId: req.userId,
    roomId:123

  });
});

/* ================= SERVER ================= */
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
