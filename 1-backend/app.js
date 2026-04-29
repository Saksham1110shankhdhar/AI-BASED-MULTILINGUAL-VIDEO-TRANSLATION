require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const transcribeRoute = require("./routes/transcribe");
const authRoute = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variable(s): ${missingEnv.join(", ")}`);
  process.exit(1);
}

app.use(cors({ origin: CLIENT_ORIGINS, credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB error:", err);
    process.exit(1);
  });

app.use("/api/auth", authRoute);
app.use("/api", transcribeRoute);

app.get("/", (req, res) => res.json({ status: "OK", message: "MultiVidAI Backend" }));
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
