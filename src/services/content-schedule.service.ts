const mongoose = require("mongoose");
const {
  ContentSchedule,
  CONTENT_CATEGORIES,
  TNPSC_GROUPS,
} = require("../models/content-schedule.model");

type ContentSchedulePayload = {
  _id?: string;
  category?: string;
  group?: string | null;
  title?: string;
  scheduledAt?: string | Date;
};

type ContentScheduleFilters = {
  category?: string;
  group?: string;
};

type StatusError = Error & { statusCode: number };

const validationError = (message: string): StatusError => {
  const error = new Error(message) as StatusError;
  error.statusCode = 400;
  return error;
};

const normalisePayload = (payload: ContentSchedulePayload, current: any = {}) => {
  const category = String(payload.category ?? current.category ?? "").trim().toLowerCase();
  const title = String(payload.title ?? current.title ?? "").trim();
  const scheduledAtValue = payload.scheduledAt ?? current.scheduledAt;
  const scheduledAt = new Date(scheduledAtValue);

  if (!CONTENT_CATEGORIES.includes(category)) {
    throw validationError(`category must be one of: ${CONTENT_CATEGORIES.join(", ")}`);
  }
  if (!title) throw validationError("title is required.");
  if (!scheduledAtValue || Number.isNaN(scheduledAt.getTime())) {
    throw validationError("scheduledAt must be a valid date and time.");
  }

  const selectedGroup = payload.group ?? current.group;
  const group = selectedGroup ? String(selectedGroup).trim().toLowerCase() : null;
  if (category === "tnpsc" && !TNPSC_GROUPS.includes(group)) {
    throw validationError(`TNPSC group must be one of: ${TNPSC_GROUPS.join(", ")}`);
  }

  return { category, title, scheduledAt, group: category === "tnpsc" ? group : null };
};

const ensureValidId = (id: string) => {
  if (!mongoose.isValidObjectId(id)) throw validationError("Invalid content schedule id.");
};

const create = async (body: ContentSchedulePayload) => {
  return ContentSchedule.create(normalisePayload(body));
};

const getAll = async (filters: ContentScheduleFilters = {}) => {
  const query: { category?: string; group?: string } = {};
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

const getById = async (id: string) => {
  ensureValidId(id);
  return ContentSchedule.findById(id);
};

const update = async (body: ContentSchedulePayload) => {
  const { _id, ...updateData } = body;
  if (!_id) throw validationError("_id is required.");
  ensureValidId(_id);

  const schedule = await ContentSchedule.findById(_id);
  if (!schedule) return null;

  return ContentSchedule.findByIdAndUpdate(
    _id,
    { $set: normalisePayload(updateData, schedule) },
    { new: true, runValidators: true },
  );
};

const remove = async (id: string) => {
  ensureValidId(id);
  return ContentSchedule.findByIdAndDelete(id);
};

module.exports = { create, getAll, getById, update, remove };
