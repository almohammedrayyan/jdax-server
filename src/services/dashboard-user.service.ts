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
  if (legacyIndexChecked) return;
  try {
    const indexes = await DashboardUser.collection.indexes();
    const legacyIndex = indexes.find((index: any) => index.unique && index.key?.snapshotDate === 1);
    if (legacyIndex) await DashboardUser.collection.dropIndex(legacyIndex.name);
  } catch (error: any) {
    // The collection does not exist until the first snapshot is inserted.
    if (error?.codeName !== "NamespaceNotFound") throw error;
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
  await DashboardUser.init();
  const metrics = await getMetrics();
  const snapshot = {
    ...metrics,
    snapshotDate: new Date(),
    startDate: new Date("2020-01-01T00:00:00.000Z"),
  };
  // Adopt the most recent existing record, preserving historical records.
  // A unique key prevents overlapping cron runs from creating new records.
  try {
    const existing = await DashboardUser.findOne({ singletonKey: "dashboard" });
    if (!existing) {
      const latest = await DashboardUser.findOne({ singletonKey: { $exists: false } }).sort({ snapshotDate: -1 });
      if (latest) {
        return await DashboardUser.findByIdAndUpdate(latest._id, { $set: { ...snapshot, singletonKey: "dashboard" } }, { new: true, runValidators: true });
      }
    }
    return await DashboardUser.findOneAndUpdate(
      { singletonKey: "dashboard" },
      { $set: snapshot },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  } catch (error: any) {
    if (error?.code !== 11000) throw error;
    return DashboardUser.findOneAndUpdate({ singletonKey: "dashboard" }, { $set: snapshot }, { new: true, runValidators: true });
  }
};

const getAllSnapshots = async () => DashboardUser.find().sort({ snapshotDate: -1 });
const getLatestSnapshot = async () => DashboardUser.findOne().sort({ snapshotDate: -1 });

module.exports = { ANALYTICS_START_DATE, getMetrics, saveTodaySnapshot, getAllSnapshots, getLatestSnapshot };
