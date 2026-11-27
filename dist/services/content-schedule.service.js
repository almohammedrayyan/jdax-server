"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const { ContentSchedule, CONTENT_CATEGORIES, TNPSC_GROUPS, } = require("../models/content-schedule.model");
const validationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};
const normalisePayload = (payload, current = {}) => {
    const category = String(payload.category ?? current.category ?? "").trim().toLowerCase();
    const title = String(payload.title ?? current.title ?? "").trim();
    const venue = String(payload.venue ?? current.venue ?? "").trim();
    const scheduledAtValue = payload.scheduledAt ?? current.scheduledAt;
    const scheduledAt = new Date(scheduledAtValue);
    if (!CONTENT_CATEGORIES.includes(category)) {
        throw validationError(`category must be one of: ${CONTENT_CATEGORIES.join(", ")}`);
    }
    if (!title)
        throw validationError("title is required.");
    if (!scheduledAtValue || Number.isNaN(scheduledAt.getTime())) {
        throw validationError("scheduledAt must be a valid date and time.");
    }
    const selectedGroup = payload.group ?? current.group;
    const group = selectedGroup ? String(selectedGroup).trim().toLowerCase() : null;
    if (category === "tnpsc" && !TNPSC_GROUPS.includes(group)) {
        throw validationError(`TNPSC group must be one of: ${TNPSC_GROUPS.join(", ")}`);
    }
    return { category, title, venue, scheduledAt, group: category === "tnpsc" ? group : null };
};
const ensureValidId = (id) => {
    if (!mongoose.isValidObjectId(id))
        throw validationError("Invalid content schedule id.");
};
const create = async (body) => {
    return ContentSchedule.create(normalisePayload(body));
};
const createBulk = async (rows) => {
    if (!Array.isArray(rows) || rows.length === 0 || rows.length > 500) {
        throw validationError("Provide between 1 and 500 schedule rows.");
    }
    const errors = [];
    const schedules = rows.map((row, index) => {
        try {
            if (!row || typeof row !== "object" || Array.isArray(row))
                throw validationError("Invalid row.");
            return normalisePayload(row);
        }
        catch (error) {
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Invalid row."}`);
            return null;
        }
    });
    if (errors.length)
        throw validationError(errors.join("\n"));
    return ContentSchedule.insertMany(schedules, { ordered: true });
};
const getAll = async (filters = {}) => {
    const query = {};
    if (filters.category) {
        const category = filters.category.trim().toLowerCase();
        if (!CONTENT_CATEGORIES.includes(category)) {
            throw validationError(`category must be one of: ${CONTENT_CATEGORIES.join(", ")}`);
        }
        query.category = category;
    }
    if (filters.group) {
        const group = filters.group.trim().toLowerCase();
        if (!TNPSC_GROUPS.includes(group)) {
            throw validationError(`group must be one of: ${TNPSC_GROUPS.join(", ")}`);
        }
        query.group = group;
    }
    return ContentSchedule.find(query).sort({ scheduledAt: 1, createdAt: -1 });
};
const getById = async (id) => {
    ensureValidId(id);
    return ContentSchedule.findById(id);
};
const update = async (body) => {
    const { _id, ...updateData } = body;
    if (!_id)
        throw validationError("_id is required.");
    ensureValidId(_id);
    const schedule = await ContentSchedule.findById(_id);
    if (!schedule)
        return null;
    return ContentSchedule.findByIdAndUpdate(_id, { $set: normalisePayload(updateData, schedule) }, { new: true, runValidators: true });
};
const remove = async (id) => {
    ensureValidId(id);
    return ContentSchedule.findByIdAndDelete(id);
};
module.exports = { create, createBulk, getAll, getById, update, remove };
