import type { Request, Response } from "express";

const service = require("../services/social-live-feed.service");

type AppError = Error & { statusCode?: number };

const sendError = (res: Response, error: AppError) => {
  const status = error.statusCode || 500;
  if (status === 500) console.error("Social live feed error:", error);
  return res.status(status).send({
    success: false,
    message: error.message || "Something went wrong.",
    data: null,
  });
};

const createSocialLiveFeed = async (req: Request, res: Response) => {
  try {
    const data = await service.create(req.body);
    return res.status(201).send({ success: true, message: "Social live feed created.", data });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

const getSocialLiveFeeds = async (_req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    return res.status(200).send({ success: true, message: "Social live feeds fetched.", data });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

const getSocialLiveFeedById = async (req: Request, res: Response) => {
  try {
    const data = await service.getById(req.params.id);
    if (!data) return res.status(404).send({ success: false, message: "Social live feed not found.", data: null });
    return res.status(200).send({ success: true, message: "Social live feed fetched.", data });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

const getAllYouTubeVideos = async (req: Request, res: Response) => {
  try {
    const pageToken = req.query.pageToken;
    if (pageToken !== undefined && (typeof pageToken !== "string" || !pageToken.trim() || pageToken.length > 1024)) {
      return res.status(400).send({ success: false, message: "Invalid page token.", data: null });
    }
    const data = await service.getAllYouTubeVideos(pageToken);
    return res.status(200).send({ success: true, message: "YouTube videos fetched.", data });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

const updateSocialLiveFeed = async (req: Request, res: Response) => {
  try {
    const data = await service.update({ ...req.body, _id: req.params.id });
    if (!data) return res.status(404).send({ success: false, message: "Social live feed not found.", data: null });
    return res.status(200).send({ success: true, message: "Social live feed updated.", data });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

const deleteSocialLiveFeed = async (req: Request, res: Response) => {
  try {
    const data = await service.remove(req.params.id);
    if (!data) return res.status(404).send({ success: false, message: "Social live feed not found.", data: null });
    return res.status(200).send({ success: true, message: "Social live feed deleted.", data });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

export = {
  createSocialLiveFeed,
  getSocialLiveFeeds,
  getAllYouTubeVideos,
  getSocialLiveFeedById,
  updateSocialLiveFeed,
  deleteSocialLiveFeed,
};
