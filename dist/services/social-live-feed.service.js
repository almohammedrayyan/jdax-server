"use strict";
const mongoose = require("mongoose");
const SocialLiveFeed = require("../models/social-live-feed.model");
const validationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};
const normalisePayload = (payload, current = {}) => {
    const platform = String(payload.platform ?? current.platform ?? "").trim().toLowerCase();
    const link = String(payload.link ?? current.link ?? "").trim();
    if (!['instagram', 'youtube'].includes(platform)) {
        throw validationError("platform must be either instagram or youtube.");
    }
    if (!link)
        throw validationError("link is required.");
    return { platform, link };
};
const ensureValidId = (id) => {
    if (!mongoose.isValidObjectId(id))
        throw validationError("Invalid social live feed id.");
};
const create = async (body) => {
    return SocialLiveFeed.create(normalisePayload(body));
};
const getAll = async () => {
    return SocialLiveFeed.find().sort({ createdAt: -1 });
};
const getById = async (id) => {
    ensureValidId(id);
    return SocialLiveFeed.findById(id);
};
const update = async (body) => {
    const { _id, ...updateData } = body;
    if (!_id)
        throw validationError("_id is required.");
    ensureValidId(_id);
    const socialLiveFeed = await SocialLiveFeed.findById(_id);
    if (!socialLiveFeed)
        return null;
    return SocialLiveFeed.findByIdAndUpdate(_id, { $set: normalisePayload(updateData, socialLiveFeed) }, { new: true, runValidators: true });
};
const remove = async (id) => {
    ensureValidId(id);
    return SocialLiveFeed.findByIdAndDelete(id);
};
module.exports = { create, getAll, getById, update, remove };
