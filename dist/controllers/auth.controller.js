"use strict";
const service = require("../services/auth.service");
const sendError = (res, error) => {
    const status = error.statusCode || 500;
    if (status === 500)
        console.error("Authentication error:", error);
    return res.status(status).send({ success: false, message: error.message || "Something went wrong.", data: null });
};
const register = async (req, res) => {
    try {
        const data = await service.register(req.body);
        return res.status(201).send({ success: true, message: "User registered successfully.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
const login = async (req, res) => {
    try {
        const data = await service.login(req.body);
        return res.status(200).send({ success: true, message: "Login successful.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
module.exports = { register, login };
