export const healthCheck = async (_req, res, next) => {
  try {
    res.status(200).json({
      status: "ok",
      service: "productivity-tracker-backend",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
