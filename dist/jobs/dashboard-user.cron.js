"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { saveTodaySnapshot } = require("../services/dashboard-user.service");
const runDashboardUserSnapshot = async () => {
    try {
        await saveTodaySnapshot();
        console.log("Dashboard user snapshot saved");
    }
    catch (error) {
        console.error("Dashboard user snapshot failed:", error);
    }
};
const startDashboardUserCron = () => {
    void runDashboardUserSnapshot();
    const intervalMs = Number.parseInt(process.env.DASHBOARD_SNAPSHOT_INTERVAL_MS ?? "300000", 10);
    setInterval(() => void runDashboardUserSnapshot(), intervalMs);
};
module.exports = { startDashboardUserCron };
