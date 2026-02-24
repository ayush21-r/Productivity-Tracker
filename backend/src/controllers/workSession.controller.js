import {
  completeWorkSession,
  getActiveWorkSession,
  getWorkSessionHistory,
  startWorkSession,
} from "../services/workSession.service.js";

export const startSession = async (req, res, next) => {
  try {
    const { activityId, processId, subProcessId, jobTypeId } = req.body;

    const result = await startWorkSession({
      userId: req.user?.id,
      activityId,
      processId,
      subProcessId,
      jobTypeId,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const completeSession = async (req, res, next) => {
  try {
    const { comment } = req.body;

    const result = await completeWorkSession({
      userId: req.user?.id,
      comment,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getActive = async (req, res, next) => {
  try {
    const result = await getActiveWorkSession({
      userId: req.user?.id,
    });

    if (!result) {
      return res.status(200).json({ session: null });
    }

    res.status(200).json({ session: result });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const { page, limit, startDate, endDate } = req.query;

    const result = await getWorkSessionHistory({
      userId: req.user?.id,
      page,
      limit,
      startDate,
      endDate,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
