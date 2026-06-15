// const moment = require("moment");

// // Convert DD-MM-YYYY + 9:40PM → UTC (ICS Format)
// const formatToICSDate = (date, time) => {
//   const dateTime = moment(`${date} ${time}`, "DD-MM-YYYY hh:mmA").utc();

//   return dateTime.format("YYYYMMDDTHHmmss") + "Z";
// };

// const buildCalendar = (event, method = "REQUEST") => {
//   console.log("===== BUILDING ICS =====");
//   console.log("UID:", event.uid);
//   console.log("SEQUENCE:", event.sequence);
//   console.log("METHOD:", method);

//   const dtStart = formatToICSDate(event.date, event.startTime);
//   const dtEnd = formatToICSDate(event.date, event.endTime);
//   const dtStamp = moment().utc().format("YYYYMMDDTHHmmss") + "Z";

//   return `BEGIN:VCALENDAR
// VERSION:2.0
// PRODID:-//AI Scheduler//Meeting Service//EN
// METHOD:${method}
// BEGIN:VEVENT
// UID:${event.uid}
// SEQUENCE:${event.sequence}
// DTSTAMP:${dtStamp}
// DTSTART:${dtStart}
// DTEND:${dtEnd}
// SUMMARY:${event.title}
// DESCRIPTION:${event.description}
// LOCATION:${event.location}
// ORGANIZER;CN=AI Scheduler:mailto:${process.env.SMTP_USER}
// ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:${event.attendeeEmail}
// STATUS:${method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}
// END:VEVENT
// END:VCALENDAR`;
// };

// module.exports = { buildCalendar };
const moment = require("moment");

/**
 * Convert DD-MM-YYYY + 4:00PM → UTC ICS
 */
const formatToICSDate = (date, time) => {
  return moment(`${date} ${time}`, "DD-MM-YYYY hh:mmA")
    .utc()
    .format("YYYYMMDDTHHmmss") + "Z";
};

/**
 * Map weekly days to ICS
 */
const mapWeekDaysToICS = (days = []) => {
  const map = {
    sun: "SU",
    mon: "MO",
    tue: "TU",
    wed: "WE",
    thu: "TH",
    fri: "FR",
    sat: "SA",
  };

  return days.map(d => map[d]).join(",");
};

/**
 * Build RRULE
 */
const buildRRule = (recurring) => {
  if (!recurring) return "";

  let rule = "";

  if (recurring.repeatType === "d") {
    rule = `FREQ=DAILY;INTERVAL=${recurring.repeatEvery}`;
  }

  if (recurring.repeatType === "w") {
    rule = `FREQ=WEEKLY;INTERVAL=${recurring.repeatEvery}`;
    const days = mapWeekDaysToICS(recurring.repeatOnWeekly);
    if (days) rule += `;BYDAY=${days}`;
  }

  if (recurring.repeatType === "m") {
    rule = `FREQ=MONTHLY;INTERVAL=${recurring.repeatEvery}`;
    if (recurring.repeatOnMonthlybyDay)
      rule += `;BYMONTHDAY=${recurring.repeatOnMonthlybyDay}`;
  }

  if (!recurring.isNeverEnd && recurring.endDate) {
    const until =
      moment(recurring.endDate, "DD-MM-YYYY")
        .utc()
        .format("YYYYMMDD") + "T235959Z";
    rule += `;UNTIL=${until}`;
  }

  return rule;
};

/**
 * Build ICS
 */
const buildCalendar = (event, method = "REQUEST") => {
    console.log("===== BUILDING ICS =====");
  console.log("UID:", event.uid);
  console.log("SEQUENCE:", event.sequence);
  console.log("METHOD:", method);
  const dtStart = formatToICSDate(event.date, event.startTime);
  const dtEnd = formatToICSDate(event.date, event.endTime);
  const dtStamp = moment().utc().format("YYYYMMDDTHHmmss") + "Z";

  const rrule = event.recurringId
    ? buildRRule(event.recurringId)
    : "";

  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//SmartMeet//Meeting Service//EN",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `SEQUENCE:${event.sequence}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    rrule ? `RRULE:${rrule}` : "",
    `SUMMARY:${event.title || ""}`,
    `DESCRIPTION:${event.description || ""}`,
    `LOCATION:${event.location || ""}`,
    `ORGANIZER;CN=SmartMeet:MAILTO:${process.env.SMTP_USER}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:${event.attendeeEmail}`,
    method === "CANCEL" ? "STATUS:CANCELLED" : "STATUS:CONFIRMED",
    "X-MS-OLK-FORCEINSPECTOROPEN:TRUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.filter(Boolean).join("\r\n");
};

module.exports = { buildCalendar };