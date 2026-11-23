"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const DashboardUser = require("../models/dashboard-user.model");
const ANALYTICS_START_DATE = "2020-01-01";
const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
        project_id: process.env.GOOGLE_PROJECT_ID,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
});
let legacyIndexChecked = false;
const removeLegacyDailySnapshotIndex = async () => {
    if (legacyIndexChecked)
        return;
    try {
        const indexes = await DashboardUser.collection.indexes();
        const legacyIndex = indexes.find((index) => index.unique && index.key?.snapshotDate === 1);
        if (legacyIndex)
            await DashboardUser.collection.dropIndex(legacyIndex.name);
    }
    catch (error) {
        // The collection does not exist until the first snapshot is inserted.
        if (error?.codeName !== "NamespaceNotFound")
            throw error;
    }
    legacyIndexChecked = true;
};
const getMetrics = async () => {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate: ANALYTICS_START_DATE, endDate: "today" }],
        metrics: [{ name: "totalUsers" }, { name: "newUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    });
    const values = response.rows?.[0]?.metricValues ?? [];
    return {
        totalUsers: Number.parseInt(values[0]?.value ?? "0", 10),
        newUsers: Number.parseInt(values[1]?.value ?? "0", 10),
        totalSessions: Number.parseInt(values[2]?.value ?? "0", 10),
        totalViews: Number.parseInt(values[3]?.value ?? "0", 10),
    };
};
const saveTodaySnapshot = async () => {
    await removeLegacyDailySnapshotIndex();
    const metrics = await getMetrics();
    return DashboardUser.create({
        ...metrics,
        snapshotDate: new Date(),
        startDate: new Date("2020-01-01T00:00:00.000Z"),
    });
};
const getAllSnapshots = async () => DashboardUser.find().sort({ snapshotDate: -1 });
const getLatestSnapshot = async () => DashboardUser.findOne().sort({ snapshotDate: -1 });
module.exports = { ANALYTICS_START_DATE, getMetrics, saveTodaySnapshot, getAllSnapshots, getLatestSnapshot };
