require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const eventRoutes = require("./routes/event.routes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/events", eventRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});

