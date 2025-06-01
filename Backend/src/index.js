const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
app.use("/api/goals", require("./routes/goals"));


app.get("/", (req, res) => {
  res.send("API de Running prête !");
});

app.listen(PORT, () => {
  console.log(`Serveur en cours sur http://localhost:${PORT}`);
});

const courseRoutes = require("./routes/courses");
app.use("/api/courses", courseRoutes);

