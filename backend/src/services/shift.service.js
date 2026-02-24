import { prisma } from "../config/prisma.js";

const SHIFT_DURATION_HOURS = 8;
const SHIFT_DURATION_SECONDS = SHIFT_DURATION_HOURS * 60 * 60;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getShiftEndFromStart = (shiftStart) => {
  const shiftEnd = new Date(shiftStart);
  shiftEnd.setHours(shiftEnd.getHours() + SHIFT_DURATION_HOURS);
  return shiftEnd;
};

export const ensureActiveShiftSession = async (userId) => {
  if (!userId) {
    throw createError("Unauthorized", 401);
  }

  const now = new Date();

  const activeShift = await prisma.shiftSession.findFirst({
    where: {
      userId,
      shiftEnd: {
        gt: now,
      },
    },
    orderBy: {
      shiftEnd: "desc",
    },
  });

  if (activeShift) {
    return activeShift;
  }

  const shiftStart = now;
  const shiftEnd = getShiftEndFromStart(shiftStart);

  return prisma.shiftSession.create({
    data: {
      userId,
      shiftStart,
      shiftEnd,
    },
  });
};

export const getActiveShiftSession = async (userId) => {
  const shift = await ensureActiveShiftSession(userId);
  const now = new Date();

  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(shift.shiftEnd).getTime() - now.getTime()) / 1000)
  );

  return {
    shiftStart: shift.shiftStart,
    shiftEnd: shift.shiftEnd,
    remainingTime: remainingSeconds,
    shiftDurationSeconds: SHIFT_DURATION_SECONDS,
  };
};
