"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { model, Schema } = require("mongoose");
const CONTENT_CATEGORIES = [
    "upsc",
    "tnpsc",
    "ssc",
    "rrb",
    "banking",
    "college-programme",
    "gs-function",
    "jee",
    "neet",
];
const TNPSC_GROUPS = ["group-1", "group-2", "group-4"];
const contentScheduleSchema = new Schema({
    category: {
        type: String,
        required: true,
        enum: CONTENT_CATEGORIES,
        lowercase: true,
        trim: true,
    },
    group: {
        type: String,
        enum: TNPSC_GROUPS,
        required() {
            return this.category === "tnpsc";
        },
        default: null,
        lowercase: true,
        trim: true,
    },
    title: { type: String, required: true, trim: true },
    venue: { type: String, trim: true, default: "" },
    scheduledAt: { type: Date, required: true },
}, { timestamps: true });
const ContentSchedule = model("ContentSchedule", contentScheduleSchema);
module.exports = { ContentSchedule, CONTENT_CATEGORIES, TNPSC_GROUPS };
