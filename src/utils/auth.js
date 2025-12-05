import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const SALT_ROUNDS = 10;

export const hashPassword = async (plain) => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

export const comparePassword = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};

export const signToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in .env");
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in .env");
  return jwt.verify(token, secret);
};
export const signShortToken = (payload, expiresIn = "5m") => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn });
};
