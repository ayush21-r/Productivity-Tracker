import { TaskStatus } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseStatus = (value) => {
  if (!value) {
    return undefined;
  }

  const normalized = String(value).trim().toUpperCase();

  if (!Object.values(TaskStatus).includes(normalized)) {
    throw createError("Invalid status filter", 400);
  }

  return normalized;
};

const parseSortDirection = (value) => {
  if (!value) {
    return "desc";
  }

  const normalized = String(value).trim().toLowerCase();

  if (normalized !== "asc" && normalized !== "desc") {
    throw createError("Invalid sort value. Use asc or desc", 400);
  }

  return normalized;
};

export const getMyTasks = async ({ userId, status, sort }) => {
  if (!userId) {
    throw createError("Unauthorized", 401);
  }

  const statusFilter = parseStatus(status);
  const sortDirection = parseSortDirection(sort);

  const tasks = await prisma.task.findMany({
    where: {
      assignedToId: userId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: {
      createdAt: sortDirection,
    },
    select: {
      id: true,
      title: true,
      description: true,
      expectedDuration: true,
      actualDuration: true,
      productivity: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return tasks;
};
