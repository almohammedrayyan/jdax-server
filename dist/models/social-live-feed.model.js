"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const socialLiveFeedSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        enum: ["instagram", "youtube"],
        lowercase: true,
        trim: true,
    },
    accountId: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });
module.exports = mongoose.model("SocialLiveFeed", socialLiveFeedSchema);
