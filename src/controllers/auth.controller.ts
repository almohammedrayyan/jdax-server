import type { Request, Response } from "express";

const service = require("../services/auth.service");

type AppError = Error & { statusCode?: number };

const sendError = (res: Response, error: AppError) => {
  const status = error.statusCode || 500;
  if (status === 500) console.error("Authentication error:", error);
  return res.status(status).send({ success: false, message: error.message || "Something went wrong.", data: null });
};

const register = async (req: Request, res: Response) => {
  try {
    const data = await service.register(req.body);
    return res.status(201).send({ success: true, message: "User registered successfully.", data });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const data = await service.login(req.body);
    return res.status(200).send({ success: true, message: "Login successful.", data });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

export = { register, login };
