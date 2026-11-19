import jwt from "jsonwebtoken";
import User, { type IUser, type UserDocument } from "../models/user.model";

type RegisterPayload = {
  name?: string;
  email?: string;
  password?: string;
};

type LoginPayload = {
  email?: string;
  password?: string;
};

type StatusError = Error & { statusCode: number };

const appError = (message: string, statusCode: number): StatusError => {
  const error = new Error(message) as StatusError;
  error.statusCode = statusCode;
  return error;
};

const normaliseEmail = (email?: string) => String(email || "").trim().toLowerCase();

const createToken = (userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw appError("JWT_SECRET is not configured.", 500);

  return jwt.sign(
    { userId },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as jwt.SignOptions["expiresIn"] },
  );
};

const serializeUser = (user: UserDocument | IUser & { _id: unknown }) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (body: RegisterPayload) => {
  const name = body.name?.trim();
  const email = normaliseEmail(body.email);
  const password = body.password || "";

  if (!email || !password) throw appError("email and password are required.", 400);
  if (password.length < 8) throw appError("password must contain at least 8 characters.", 400);

  const existingUser = await User.findOne({ email });
  if (existingUser) throw appError("An account with this email already exists.", 409);

  const user = await User.create({ name, email, password });
  return { user: serializeUser(user), token: createToken(user._id.toString()) };
};

const login = async (body: LoginPayload) => {
  const email = normaliseEmail(body.email);
  const password = body.password || "";

  if (!email || !password) throw appError("email and password are required.", 400);

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw appError("Invalid email or password.", 401);
  }

  return { user: serializeUser(user), token: createToken(user._id.toString()) };
};

export = { register, login };
