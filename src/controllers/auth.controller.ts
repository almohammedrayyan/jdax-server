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

const me = async (req: Request & { userId?: string }, res: Response) => {
  try {
    const user = await service.getUser(req.userId);
    if (!user) return res.status(404).send({ success: false, message: "User not found.", data: null });
    return res.status(200).send({ success: true, data: user });
  } catch (error) {
    return sendError(res, error as AppError);
  }
};

const logout = (_req: Request, res: Response) => res.status(200).send({ success: true, message: "Logged out. Discard the token on the client.", data: null });

export = { register, login, me, logout };
