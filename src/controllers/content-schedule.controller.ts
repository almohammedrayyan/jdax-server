import type { Request, Response } from "express";

const service = require("../services/content-schedule.service");

type AppError = Error & { statusCode?: number };

const sendError = (res: Response, error: AppError) => {
  const status = error.statusCode || 500;
  if (status === 500) console.error("Content schedule error:", error);
  return res.status(status).send({
    success: false,
    message: error.message || "Something went wrong.",
    data: null,
  });
};

const createContentSchedule = async (req: Request, res: Response) => {
  try {
    const data = await service.create(req.body);
    return res.status(201).send({ success: true, message: "Content schedule created.", data });
  } catch (error) {
    return sendError(res, error);
  }
};

const createBulkContentSchedules = async (req: Request, res: Response) => {
  try {
    const data = await service.createBulk(req.body?.rows);
    return res.status(201).send({ success: true, message: `${data.length} content schedules created.`, data });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

const getContentSchedules = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll(req.query);
    return res.status(200).send({ success: true, message: "Content schedules fetched.", data });
  } catch (error) {
    return sendError(res, error);
  }
};

const getContentScheduleById = async (req: Request, res: Response) => {
  try {
    const data = await service.getById(req.params.id);
    if (!data) return res.status(404).send({ success: false, message: "Content schedule not found.", data: null });
    return res.status(200).send({ success: true, message: "Content schedule fetched.", data });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateContentSchedule = async (req: Request, res: Response) => {
  try {
    const data = await service.update({ ...req.body, _id: req.params.id });
    if (!data) return res.status(404).send({ success: false, message: "Content schedule not found.", data: null });
    return res.status(200).send({ success: true, message: "Content schedule updated.", data });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteContentSchedule = async (req: Request, res: Response) => {
  try {
    const data = await service.remove(req.params.id);
    if (!data) return res.status(404).send({ success: false, message: "Content schedule not found.", data: null });
    return res.status(200).send({ success: true, message: "Content schedule deleted.", data });
  } catch (error) {
    return sendError(res, error);
  }
};

export = {
  createContentSchedule,
  createBulkContentSchedules,
  getContentSchedules,
  getContentScheduleById,
  updateContentSchedule,
  deleteContentSchedule,
};
