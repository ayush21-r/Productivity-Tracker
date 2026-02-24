import { getMyTasks } from "../services/task.service.js";

export const getMyTasksController = async (req, res, next) => {
  try {
    const tasks = await getMyTasks({
      userId: req.user?.id,
      status: req.query.status,
      sort: req.query.sort,
    });

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    next(error);
  }
};
