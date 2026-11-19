const mongoose = require("mongoose");
const SocialLiveFeed = require("../models/social-live-feed.model");

type SocialLiveFeedPayload = {
  _id?: string;
  platform?: string;
  link?: string;
};

type StatusError = Error & { statusCode: number };

const validationError = (message: string): StatusError => {
  const error = new Error(message) as StatusError;
  error.statusCode = 400;
  return error;
};

const normalisePayload = (payload: SocialLiveFeedPayload, current: any = {}) => {
  const platform = String(payload.platform ?? current.platform ?? "").trim().toLowerCase();
  const link = String(payload.link ?? current.link ?? "").trim();

  if (!['instagram', 'youtube'].includes(platform)) {
    throw validationError("platform must be either instagram or youtube.");
  }
  if (!link) throw validationError("link is required.");

  return { platform, link };
};

const ensureValidId = (id: string) => {
  if (!mongoose.isValidObjectId(id)) throw validationError("Invalid social live feed id.");
};

const create = async (body: SocialLiveFeedPayload) => {
  return SocialLiveFeed.create(normalisePayload(body));
};

const getAll = async () => {
  return SocialLiveFeed.find().sort({ createdAt: -1 });
};

const getById = async (id: string) => {
  ensureValidId(id);
  return SocialLiveFeed.findById(id);
};

const update = async (body: SocialLiveFeedPayload) => {
  const { _id, ...updateData } = body;
  if (!_id) throw validationError("_id is required.");
  ensureValidId(_id);

  const socialLiveFeed = await SocialLiveFeed.findById(_id);
  if (!socialLiveFeed) return null;

  return SocialLiveFeed.findByIdAndUpdate(
    _id,
    { $set: normalisePayload(updateData, socialLiveFeed) },
    { new: true, runValidators: true },
  );
};

const remove = async (id: string) => {
  ensureValidId(id);
  return SocialLiveFeed.findByIdAndDelete(id);
};

export = { create, getAll, getById, update, remove };
