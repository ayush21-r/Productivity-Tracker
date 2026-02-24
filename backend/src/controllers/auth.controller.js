import { getEmployeeById, loginEmployee } from "../services/auth.service.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginEmployee({ email, password });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getEmployeeById(req.user.id);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
