require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const express = require("express");
const cors = require("cors");
const contentScheduleRoutes = require("./routes/content-schedule.routes");
const socialLiveFeedRoutes = require("./routes/social-live-feed.routes");
const authRoutes = require("./routes/auth.routes");
const connectDB = require("./config/db");
const { startDashboardUserCron } = require("./jobs/dashboard-user.cron");

const eventRoutes = require("./routes/event.routes");
const contactRoutes = require("./routes/contact.routes");

const app = express();

const allowedOrigins = [
  "https://jdax.in",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://jdax-admin.netlify.app",
  ...(process.env.ADMIN_ORIGINS ?? "")
    .split(",")
    .map((origin: string) => origin.trim())
    .filter(Boolean),
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/events", eventRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/content-schedules", contentScheduleRoutes);
app.use("/api/social-live-feeds", socialLiveFeedRoutes);
app.use("/api/auth", authRoutes);

const startServer = async () => {
  await connectDB();
  startDashboardUserCron();
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});
