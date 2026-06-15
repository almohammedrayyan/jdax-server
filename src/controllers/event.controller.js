const { v4: uuidv4 } = require("uuid");
const Event = require("../models/event.models");
const RecurringMeeting = require("../models/recurring.models");
const { sendInviteMail } = require("../services/mail.services");
const { buildCalendar } = require("../services/calendar.services");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const jsonCredentials = require("../service-account.json");

const analyticsDataClient = new BetaAnalyticsDataClient({
  // Use the 'credentials' option when passing an object directly
  credentials: PROCESS.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const PROPERTY_ID = PROCESS.env.GA4_PROPERTY_ID;
/**
 * CREATE EVENT (Single or Recurring)
 */
exports.createEvent = async (req, res) => {
  try {
    let recurringDoc = null;

    if (req.body.recurringData) {
      recurringDoc = await RecurringMeeting.create(req.body.recurringData);
    }

    const event = await Event.create({
      ...req.body,
      uid: uuidv4(),
      sequence: 0,
      recurringId: recurringDoc ? recurringDoc._id : null,
    });

    const populatedEvent = await Event.findById(event._id).populate(
      "recurringId",
    );

    // const ics = buildCalendar(populatedEvent, "REQUEST");

    await sendInviteMail(populatedEvent, "REQUEST");

    res.json({ success: true, event: populatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create failed" });
  }
};

// ==========================
// UPDATE EVENT
// ==========================
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("recurringId");

    if (!event) {
      return res.status(404).json({ error: "Not found" });
    }

    // 🔥 1️⃣ Update recurring if provided
    if (req.body.recurringData && event.recurringId) {
      await RecurringMeeting.findByIdAndUpdate(
        event.recurringId._id,
        req.body.recurringData,
        { new: true },
      );
    }

    // 🔥 2️⃣ Update event fields
    Object.assign(event, req.body);

    // 🔥 3️⃣ Increase sequence (VERY IMPORTANT for Outlook)
    event.sequence += 1;

    await event.save();

    // 🔥 4️⃣ Re-populate to get updated recurring data
    const updatedEvent = await Event.findById(event._id).populate(
      "recurringId",
    );

    // 🔥 5️⃣ Send updated invite
    await sendInviteMail(updatedEvent, "REQUEST");

    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

// ==========================
// CANCEL EVENT
// ==========================
exports.cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("recurringId");

    if (!event) return res.status(404).json({ error: "Not found" });

    event.sequence += 1;
    await event.save();

    // const ics = buildCalendar(event, );
    await sendInviteMail(event, "CANCEL");

    res.json({ success: true, message: "Cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Cancel failed" });
  }
};

exports.getRealTimeVisitors = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: "2020-01-01", // Adjust to your platform's tracking launch date
          endDate: "today",
        },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
    });

    // Handle structural safety check for pristine or empty properties
    if (!response.rows || response.rows.length === 0) {
      return res.json({
        totalUsers: 0,
        newUsers: 0,
        totalSessions: 0,
        totalViews: 0,
      });
    }

    // Map rows arrays safely to match index sequence order defined above
    const totalUsers = response.rows[0].metricValues[0].value;
    const newUsers = response.rows[0].metricValues[1].value;
    const totalSessions = response.rows[0].metricValues[2].value;
    const totalViews = response.rows[0].metricValues[3].value;

    res.json({
      totalUsers: parseInt(totalUsers, 10),
      newUsers: parseInt(newUsers, 10),
      totalSessions: parseInt(totalSessions, 10),
      totalViews: parseInt(totalViews, 10),
    });
  } catch (error) {
    console.error("Error hitting Google Data API:", error);
    res.status(500).json({ error: "Failed to parse platform metrics dataset" });
  }
};
