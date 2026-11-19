"use strict";
const service = require("../services/content-schedule.service");
const sendError = (res, error) => {
    const status = error.statusCode || 500;
    if (status === 500)
        console.error("Content schedule error:", error);
    return res.status(status).send({
        success: false,
        message: error.message || "Something went wrong.",
        data: null,
    });
};
const createContentSchedule = async (req, res) => {
    try {
        const data = await service.create(req.body);
        return res.status(201).send({ success: true, message: "Content schedule created.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
const getContentSchedules = async (req, res) => {
    try {
        const data = await service.getAll(req.query);
        return res.status(200).send({ success: true, message: "Content schedules fetched.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
const getContentScheduleById = async (req, res) => {
    try {
        const data = await service.getById(req.params.id);
        if (!data)
            return res.status(404).send({ success: false, message: "Content schedule not found.", data: null });
        return res.status(200).send({ success: true, message: "Content schedule fetched.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
const updateContentSchedule = async (req, res) => {
    try {
        const data = await service.update({ ...req.body, _id: req.params.id });
        if (!data)
            return res.status(404).send({ success: false, message: "Content schedule not found.", data: null });
        return res.status(200).send({ success: true, message: "Content schedule updated.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
const deleteContentSchedule = async (req, res) => {
    try {
        const data = await service.remove(req.params.id);
        if (!data)
            return res.status(404).send({ success: false, message: "Content schedule not found.", data: null });
        return res.status(200).send({ success: true, message: "Content schedule deleted.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
module.exports = {
    createContentSchedule,
    getContentSchedules,
    getContentScheduleById,
    updateContentSchedule,
    deleteContentSchedule,
};
