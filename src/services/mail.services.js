const nodemailer = require("nodemailer");
const { buildCalendar } = require("./calendar.services");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendInviteMail = async (
  event,
  method = "REQUEST",
) => {
  try {
    console.log("===== SENDING MAIL =====");
    console.log("To:", event.attendeeEmail);
    console.log("UID:", event.uid);

    const icsContent = buildCalendar(event, method);

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: event.attendeeEmail,
      subject:
        method === "CANCEL"
          ? "Meeting Cancelled"
          : event.sequence === 0
            ? "Meeting Invitation"
            : "Meeting Updated",

      html: `
        <h2>${event.title}</h2>
        <p>${event.description}</p>
        <p><b>Date:</b> ${event.date}</p>
        <p><b>Time:</b> ${event.startTime} - ${event.endTime}</p>
        <p><b>Location:</b> ${event.location}</p>
      `,

      headers: {
        "Content-Class": "urn:content-classes:calendarmessage",
      },
      attachments: [
        {
          filename: "invite.ics",
          content: icsContent,
          contentType: `text/calendar; method=${method}; charset=UTF-8`,
        },
      ],
    });

    console.log("Mail sent:", info.messageId);
  } catch (error) {
    console.error("Mail error:", error);
  }
};

module.exports = { sendInviteMail };
