/*************************************************
 * SmartMeet Microservices - Meetings
 * RecurringMeetingModel.ts
 * Created by Maniratnam on 03/01/2025
 * Copyright
 *************************************************/

// import plugins
const mongoose = require("mongoose");


// import utils
const WEEK = {
  sun: "sun",
  mon: "mon",
  tue: "tue",
  wed: "wed",
  thu: "thu",
  fri: "fri",
  sat: "sat",
}

// schema
const schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminmodels",
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    isNeverEnd: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: String,
      default: "",
    },
    endTime: {
      type: String,
      default: "",
    },

    repeatType: {
      type: String,
      default: "",
      enum: ["d", "w", "m"],
    },
    repeatEvery: {
      type: Number,
      default: 1,
    },

    repeatOnWeekly: {
      type: [String],
      default: [],
      enum: [
        WEEK.sun,
        WEEK.mon,
        WEEK.tue,
        WEEK.wed,
        WEEK.thu,
        WEEK.fri,
        WEEK.sat,
      ],
    },
    repeatOnMonthlybyDay: {
      type: Number,
      default: 0,
    },
    repeatOnMonthlybyWeek: {
      every: {
        type: Number,
        default: 0,
      },
      week: {
        type: [String],
        default: [],
        enum: [
          WEEK.sun,
          WEEK.mon,
          WEEK.tue,
          WEEK.wed,
          WEEK.thu,
          WEEK.fri,
          WEEK.sat,
        ],
      },
    },
  },
  {
    timestamps: {
      currentTime: () => {
        let date = new Date();
        let newDate = new Date(
          date.getTime() + date.getTimezoneOffset() * 60 * 1000 * -1
        );
        return newDate;
      },
    },
  }
);

// model
module.exports= mongoose.model("recurringmeetingmodels", schema);

// export
