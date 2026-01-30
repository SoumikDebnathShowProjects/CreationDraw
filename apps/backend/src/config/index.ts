import dotenv from "dotenv";

dotenv.config();

export const config = {
  // =============================
  // Server
  // =============================
  port: Number(process.env.PORT) || 3002, // ✅ BACKEND ON 3002

  // =============================
  // Security
  // =============================
  jwtSecret:
    process.env.JWT_SECRET || "your-secret-key-change-in-production",

  // =============================
  // CORS (FRONTEND PORT)
  // =============================
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3001",

  // =============================
  // Environment
  // =============================
  nodeEnv: process.env.NODE_ENV || "development",

  // =============================
  // Database
  // =============================
  databaseUrl: process.env.DATABASE_URL || "",
};

// =============================
// VALIDATIONS
// =============================

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET === "your-secret-key-change-in-production"
) {
  console.warn(
    "⚠️  WARNING: Using default JWT_SECRET. Change this in production!"
  );
}
