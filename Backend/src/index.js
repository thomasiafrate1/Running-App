const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const adminGoalsRoutes = require("./routes/adminGoals");

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
app.use("/api/goals", require("./routes/goals"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/admin/goals", adminGoalsRoutes);
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/feedback", require("./routes/feedback"));

const interactionRoutes = require("./routes/interactions");
app.use("/api/interactions", interactionRoutes);

app.get("/", (req, res) => {
  res.send("API de Running prête !");
});

app.listen(PORT, () => {
  console.log(`Serveur en cours sur http://localhost:${PORT}`);
});

const courseRoutes = require("./routes/courses");
app.use("/api/courses", courseRoutes);

