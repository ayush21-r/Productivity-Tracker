import { getActiveShiftSession } from "../services/shift.service.js";

export const getActiveShift = async (req, res, next) => {
  try {
    const result = await getActiveShiftSession(req.user?.id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
