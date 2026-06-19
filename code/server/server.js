import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("LoneWolf API is running");
});

// feedbackRoutes is mounted on the same /api/events prefix because its
// endpoints are nested under an event id (e.g. POST /api/events/:id/feedback).
app.use("/api/events", eventRoutes);
app.use("/api/events", feedbackRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

