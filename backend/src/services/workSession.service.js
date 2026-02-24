import { prisma } from "../config/prisma.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateWorkSessionInput = ({ activityId, processId, subProcessId, jobTypeId }) => {
  if (!activityId || !processId || !subProcessId || !jobTypeId) {
    throw createError("activityId, processId, subProcessId, and jobTypeId are required", 400);
  }
};

const DEFAULT_EXPECTED_DURATION_MINUTES = 120;

const normalizeExpectedDuration = (value) => {
  if (typeof value === "number" && value > 0) {
    return value;
  }

  return DEFAULT_EXPECTED_DURATION_MINUTES;
};

const calculateProductivity = (expectedDuration, actualDuration) => {
  if (typeof expectedDuration !== "number" || typeof actualDuration !== "number" || actualDuration <= 0) {
    return null;
  }

  return Number(((expectedDuration / actualDuration) * 100).toFixed(2));
};

export const startWorkSession = async ({
  userId,
  activityId,
  processId,
  subProcessId,
  jobTypeId,
}) => {
  if (!userId) {
    throw createError("Unauthorized", 401);
  }

  validateWorkSessionInput({ activityId, processId, subProcessId, jobTypeId });

  const activeSession = await prisma.workSession.findFirst({
    where: {
      userId,
      endTime: null,
    },
  });

  if (activeSession) {
    throw createError("An active work session already exists for this user", 409);
  }

  const [activity, process, subProcess, jobType] = await Promise.all([
    prisma.activity.findUnique({ where: { id: activityId } }),
    prisma.process.findUnique({ where: { id: processId } }),
    prisma.subProcess.findUnique({ where: { id: subProcessId } }),
    prisma.jobType.findUnique({ where: { id: jobTypeId } }),
  ]);

  if (!activity || !process || !subProcess || !jobType) {
    throw createError("One or more master data references are invalid", 400);
  }

  const task = await prisma.task.create({
    data: {
      title: `${activity.name} - ${subProcess.name}`,
      description: `${jobType.name} for ${process.name}`,
      expectedDuration: DEFAULT_EXPECTED_DURATION_MINUTES,
      status: "IN_PROGRESS",
      assignedToId: userId,
      activityId,
      processId,
      subProcessId,
      jobTypeId,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  const startTime = new Date();

  const workSession = await prisma.workSession.create({
    data: {
      userId,
      taskId: task.id,
      startTime,
    },
    select: {
      id: true,
      taskId: true,
      startTime: true,
    },
  });

  return {
    sessionId: workSession.id,
    taskId: workSession.taskId,
    startTime: workSession.startTime,
    activityName: activity.name,
    processName: process.name,
    subProcessName: subProcess.name,
    jobTypeName: jobType.name,
  };
};

export const completeWorkSession = async ({ userId, comment }) => {
  if (!userId) {
    throw createError("Unauthorized", 401);
  }

  const workSession = await prisma.workSession.findFirst({
    where: {
      userId,
      endTime: null,
    },
    include: {
      task: true,
    },
  });

  if (!workSession) {
    throw createError("No active work session found", 404);
  }

  const endTime = new Date();
  const durationMinutes = Math.round(
    (endTime.getTime() - workSession.startTime.getTime()) / (1000 * 60)
  );

  const updatedSession = await prisma.workSession.update({
    where: { id: workSession.id },
    data: {
      endTime,
      duration: durationMinutes,
      comment: comment || null,
    },
    select: {
      id: true,
      duration: true,
    },
  });

  const task = workSession.task;
  const newActualDuration = task.actualDuration + durationMinutes;

  const expectedDuration = normalizeExpectedDuration(task.expectedDuration);
  const productivity = calculateProductivity(expectedDuration, newActualDuration);

  const updatedTask = await prisma.task.update({
    where: { id: task.id },
    data: {
      status: "COMPLETED",
      actualDuration: newActualDuration,
      productivity,
    },
    select: {
      id: true,
      actualDuration: true,
      productivity: true,
    },
  });

  return {
    sessionId: workSession.id,
    taskId: task.id,
    totalDuration: updatedSession.duration,
    actualDuration: updatedTask.actualDuration,
    productivity: updatedTask.productivity,
    comment: comment || null,
  };
};

export const getActiveWorkSession = async ({ userId }) => {
  if (!userId) {
    throw createError("Unauthorized", 401);
  }

  const workSession = await prisma.workSession.findFirst({
    where: {
      userId,
      endTime: null,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          description: true,
          expectedDuration: true,
          actualDuration: true,
          activity: { select: { name: true } },
          process: { select: { name: true } },
          subProcess: { select: { name: true } },
          jobType: { select: { name: true } },
        },
      },
    },
  });

  if (!workSession) {
    return null;
  }

  return {
    sessionId: workSession.id,
    taskId: workSession.task.id,
    taskTitle: workSession.task.title,
    taskDescription: workSession.task.description,
    expectedDuration: workSession.task.expectedDuration,
    actualDuration: workSession.task.actualDuration,
    activityName: workSession.task.activity?.name || null,
    processName: workSession.task.process?.name || null,
    subProcessName: workSession.task.subProcess?.name || null,
    jobTypeName: workSession.task.jobType?.name || null,
    startTime: workSession.startTime,
  };
};

const parsePaginationParams = (page, limit) => {
  let pageNum = parseInt(page, 10) || 1;
  let limitNum = parseInt(limit, 10) || 20;

  if (pageNum < 1) pageNum = 1;
  if (limitNum < 1) limitNum = 1;
  if (limitNum > 100) limitNum = 100;

  return { pageNum, limitNum };
};

const parseDateParam = (dateStr) => {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw createError("Invalid date format. Use ISO 8601 format (YYYY-MM-DD)", 400);
  }

  return date;
};

export const getWorkSessionHistory = async ({
  userId,
  page,
  limit,
  startDate,
  endDate,
}) => {
  if (!userId) {
    throw createError("Unauthorized", 401);
  }

  const { pageNum, limitNum } = parsePaginationParams(page, limit);

  const where = {
    userId,
    endTime: { not: null },
  };

  if (startDate || endDate) {
    where.startTime = {};

    if (startDate) {
      const start = parseDateParam(startDate);
      where.startTime.gte = start;
    }

    if (endDate) {
      const end = parseDateParam(endDate);
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      where.startTime.lte = endOfDay;
    }
  }

  const [total, workSessions] = await Promise.all([
    prisma.workSession.count({ where }),
    prisma.workSession.findMany({
      where,
      include: {
        task: {
          select: {
            expectedDuration: true,
            actualDuration: true,
            productivity: true,
            activity: { select: { name: true } },
            process: { select: { name: true } },
            subProcess: { select: { name: true } },
            jobType: { select: { name: true } },
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
  ]);

  const historyData = workSessions.map((session) => {
    const expectedDuration = normalizeExpectedDuration(session.task.expectedDuration);
    const actualDuration = typeof session.task.actualDuration === "number"
      ? session.task.actualDuration
      : session.duration;

    const computedProductivity = calculateProductivity(expectedDuration, actualDuration);
    const productivity = typeof session.task.productivity === "number"
      ? Number(session.task.productivity)
      : computedProductivity;

    return {
      shift: "General",
      startTime: session.startTime,
      endTime: session.endTime,
      totalDuration: session.duration,
      expectedDuration,
      actualDuration,
      activityName: session.task.activity?.name || null,
      processName: session.task.process?.name || null,
      subProcessName: session.task.subProcess?.name || null,
      jobTypeName: session.task.jobType?.name || null,
      productivity,
      comment: session.comment,
    };
  });

  return {
    data: historyData,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
    },
  };
};
