import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma.js";
import { ensureActiveShiftSession } from "./shift.service.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getJwtConfig = () => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  if (!secret) {
    throw createError("Authentication is not configured", 500);
  }

  return { secret, expiresIn };
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const loginEmployee = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw createError("User account is inactive", 403);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw createError("Invalid email or password", 401);
  }

  const { secret, expiresIn } = getJwtConfig();

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn }
  );

  await ensureActiveShiftSession(user.id);

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const getEmployeeById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || !user.isActive) {
    throw createError("User not found", 404);
  }

  return user;
};
