const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    title: String,
    description: String,
    location: String,
    date: String,
    startTime: String,
    endTime: String,
    attendeeEmail: String,
    sequence: {
      type: Number,
      default: 0,
    },
     recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "recurringmeetingmodels",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
