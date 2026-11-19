"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) {
        return res.status(401).send({ success: false, message: "Authentication required.", data: null });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        if (!payload.userId || typeof payload.userId !== "string")
            throw new Error("Invalid token payload.");
        req.userId = payload.userId;
        return next();
    }
    catch {
        return res.status(401).send({ success: false, message: "Invalid or expired token.", data: null });
    }
};
module.exports = { authenticate };
