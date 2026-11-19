"use strict";
const service = require("../services/social-live-feed.service");
const sendError = (res, error) => {
    const status = error.statusCode || 500;
    if (status === 500)
        console.error("Social live feed error:", error);
    return res.status(status).send({
        success: false,
        message: error.message || "Something went wrong.",
        data: null,
    });
};
const createSocialLiveFeed = async (req, res) => {
    try {
        const data = await service.create(req.body);
        return res.status(201).send({ success: true, message: "Social live feed created.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
const getSocialLiveFeeds = async (_req, res) => {
    try {
        const data = await service.getAll();
        return res.status(200).send({ success: true, message: "Social live feeds fetched.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
const getSocialLiveFeedById = async (req, res) => {
    try {
        const data = await service.getById(req.params.id);
        if (!data)
            return res.status(404).send({ success: false, message: "Social live feed not found.", data: null });
        return res.status(200).send({ success: true, message: "Social live feed fetched.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
const updateSocialLiveFeed = async (req, res) => {
    try {
        const data = await service.update({ ...req.body, _id: req.params.id });
        if (!data)
            return res.status(404).send({ success: false, message: "Social live feed not found.", data: null });
        return res.status(200).send({ success: true, message: "Social live feed updated.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
const deleteSocialLiveFeed = async (req, res) => {
    try {
        const data = await service.remove(req.params.id);
        if (!data)
            return res.status(404).send({ success: false, message: "Social live feed not found.", data: null });
        return res.status(200).send({ success: true, message: "Social live feed deleted.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
module.exports = {
    createSocialLiveFeed,
    getSocialLiveFeeds,
    getSocialLiveFeedById,
    updateSocialLiveFeed,
    deleteSocialLiveFeed,
};
