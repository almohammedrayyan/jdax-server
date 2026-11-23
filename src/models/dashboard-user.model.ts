const mongoose = require("mongoose");

const dashboardUserSchema = new mongoose.Schema(
  {
    snapshotDate: { type: Date, required: true, default: Date.now },
    startDate: { type: Date, required: true, default: () => new Date("2020-01-01T00:00:00.000Z") },
    totalUsers: { type: Number, required: true, default: 0 },
    newUsers: { type: Number, required: true, default: 0 },
    totalSessions: { type: Number, required: true, default: 0 },
    totalViews: { type: Number, required: true, default: 0 },
  },
  { collection: "dashboard_users", timestamps: true },
);

module.exports = mongoose.model("DashboardUser", dashboardUserSchema);
