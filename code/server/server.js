import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("LoneWolf API is running");
});

app.use("/api/auth", authRoutes);
// feedbackRoutes is mounted on the same /api/events prefix because its
// endpoints are nested under an event id (e.g. POST /api/events/:id/feedback).
app.use("/api/events", eventRoutes);
app.use("/api/events", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((err, req, res, next) => 
{
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  });
