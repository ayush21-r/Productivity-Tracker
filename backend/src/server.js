import "dotenv/config";

import app from "./app.js";
import { prisma } from "./config/prisma.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await prisma.$connect();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
