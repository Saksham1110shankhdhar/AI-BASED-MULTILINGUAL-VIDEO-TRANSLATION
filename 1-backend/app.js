require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const transcribeRoute = require("./routes/transcribe");
const authRoute       = require("./routes/auth");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── MongoDB ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ── Routes ──
app.use("/api/auth",      authRoute);
app.use("/api",           transcribeRoute);

app.get("/", (req, res) => res.json({ status: "OK", message: "MultiVidAI Backend" }));

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

