"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const appError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
const normaliseEmail = (email) => String(email || "").trim().toLowerCase();
const createToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw appError("JWT_SECRET is not configured.", 500);
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: (process.env.JWT_EXPIRES_IN || "1d") });
};
const serializeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
const register = async (body) => {
    const name = body.name?.trim();
    const email = normaliseEmail(body.email);
    const password = body.password || "";
    if (!name)
        throw appError("name is required.", 400);
    if (name.length > 100)
        throw appError("name must contain at most 100 characters.", 400);
    if (!email || !password)
        throw appError("email and password are required.", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw appError("Enter a valid email address.", 400);
    if (password.length < 8)
        throw appError("password must contain at least 8 characters.", 400);
    const existingUser = await user_model_1.default.findOne({ email });
    if (existingUser)
        throw appError("An account with this email already exists.", 409);
    if (!process.env.JWT_SECRET)
        throw appError("JWT_SECRET is not configured.", 500);
    try {
        const user = await user_model_1.default.create({ name, email, password });
        return { user: serializeUser(user), token: createToken(user._id.toString()) };
    }
    catch (error) {
        if (error?.code === 11000)
            throw appError("An account with this email already exists.", 409);
        throw error;
    }
};
const login = async (body) => {
    const email = normaliseEmail(body.email);
    const password = body.password || "";
    if (!email || !password)
        throw appError("email and password are required.", 400);
    const user = await user_model_1.default.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
        throw appError("Invalid email or password.", 401);
    }
    return { user: serializeUser(user), token: createToken(user._id.toString()) };
};
const getUser = async (userId) => {
    const user = await user_model_1.default.findById(userId);
    return user ? serializeUser(user) : null;
};
module.exports = { register, login, getUser };
