import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { middleware } from "./middleware";
import {JWT_SECRET} from "@repo/backend-common/config"
import {prisma}from "@repo/db/client"
import { SignupSchema, SigninSchema } from "@repo/common/types";

const app = express();
app.use(express.json());

// temporary in-memory store (replace with DB later)

/* ================= SIGNUP ================= */
app.post("/signup", async (req, res) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const { email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  res.json({ message: "Signup successful" });
});

/* ================= SIGNIN ================= */
app.post("/signin", async (req, res) => {
  const parsed = SigninSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/* ================= PROTECTED ROUTE ================= */
app.post("/room", middleware, async (req, res) => {
  res.json({
    message: "Room created successfully",
    roomId: 123,
  });
});

/* ================= SERVER ================= */
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
