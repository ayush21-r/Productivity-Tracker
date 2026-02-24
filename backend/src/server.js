import "dotenv/config";
import bcrypt from "bcryptjs";

import app from "./app.js";
import { prisma } from "./config/prisma.js";

const PORT = process.env.PORT || 4000;

const autoSeed = async () => {
  const userCount = await prisma.user.count();
  if (userCount > 0) return;

  console.log("No users found — running auto-seed...");

  // Seed master data
  const activities = ["Development", "Testing", "Documentation"];
  for (const name of activities) {
    await prisma.activity.upsert({ where: { name }, update: {}, create: { name } });
  }

  const eng = await prisma.process.upsert({ where: { name: "Engineering" }, update: {}, create: { name: "Engineering" } });
  const qa = await prisma.process.upsert({ where: { name: "Quality Assurance" }, update: {}, create: { name: "Quality Assurance" } });

  const subProcesses = [
    { name: "API Development", processId: eng.id },
    { name: "Code Review", processId: eng.id },
    { name: "Functional Testing", processId: qa.id },
  ];
  for (const sp of subProcesses) {
    await prisma.subProcess.upsert({
      where: { processId_name: { processId: sp.processId, name: sp.name } },
      update: {},
      create: sp,
    });
  }

  for (const name of ["Feature", "Bug Fix", "Maintenance"]) {
    await prisma.jobType.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Seed employee user
  const hashed = await bcrypt.hash("Employee@123", 12);
  await prisma.user.upsert({
    where: { email: "employee@productivitytracker.com" },
    update: { name: "Demo Employee", password: hashed, role: "EMPLOYEE", isActive: true },
    create: { name: "Demo Employee", email: "employee@productivitytracker.com", password: hashed, role: "EMPLOYEE", isActive: true },
  });

  console.log("Auto-seed complete. Login: employee@productivitytracker.com / Employee@123");
};

const startServer = async () => {
  try {
    await prisma.$connect();
    await autoSeed();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
