const { v4: uuidv4 } = require("uuid");
const Event = require("../models/event.models");
const RecurringMeeting = require("../models/recurring.models");
const { sendInviteMail } = require("../services/mail.services");
const { buildCalendar } = require("../services/calendar.services");
const { getAllSnapshots } = require("../services/dashboard-user.service");
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
    const data = await getAllSnapshots();
    const latest = data[0];
    res.json({
      totalUsers: latest?.totalUsers ?? 0,
      newUsers: latest?.newUsers ?? 0,
      totalSessions: latest?.totalSessions ?? 0,
      totalViews: latest?.totalViews ?? 0,
      data,
    });
  } catch (error) {
    console.error("Error reading dashboard visitor snapshots:", error);
    res.status(500).json({ error: "Failed to fetch dashboard visitor snapshots" });
  }
};
