import jwt from "jsonwebtoken";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const validateLoginInput = (req, _res, next) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return next(createError("Email and password are required", 400));
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return next(createError("Email and password must be strings", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return next(createError("Invalid email format", 400));
  }

  req.body.email = normalizedEmail;
  req.body.password = password;
  next();
};

export const verifyToken = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createError("Authorization token is required", 401));
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(createError("Authentication is not configured", 500));
  }

  try {
    const payload = jwt.verify(token, secret);

    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch (_error) {
    next(createError("Invalid or expired token", 401));
  }
};
