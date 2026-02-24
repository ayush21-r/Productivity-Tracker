import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedMasterData = async () => {
  const activities = ["Development", "Testing", "Documentation"];
  const processNames = ["Engineering", "Quality Assurance"];
  const jobTypes = ["Feature", "Bug Fix", "Maintenance"];

  for (const activityName of activities) {
    await prisma.activity.upsert({
      where: { name: activityName },
      update: {},
      create: { name: activityName },
    });
  }

  const engineeringProcess = await prisma.process.upsert({
    where: { name: processNames[0] },
    update: {},
    create: { name: processNames[0] },
  });

  const qaProcess = await prisma.process.upsert({
    where: { name: processNames[1] },
    update: {},
    create: { name: processNames[1] },
  });

  const subProcesses = [
    { name: "API Development", processId: engineeringProcess.id },
    { name: "Code Review", processId: engineeringProcess.id },
    { name: "Functional Testing", processId: qaProcess.id },
  ];

  for (const subProcessData of subProcesses) {
    await prisma.subProcess.upsert({
      where: {
        processId_name: {
          processId: subProcessData.processId,
          name: subProcessData.name,
        },
      },
      update: {},
      create: subProcessData,
    });
  }

  for (const jobTypeName of jobTypes) {
    await prisma.jobType.upsert({
      where: { name: jobTypeName },
      update: {},
      create: { name: jobTypeName },
    });
  }

  console.log("Seeded master data: activities, processes, subprocesses, job types.");
};

const seedEmployee = async () => {
  const plainPassword = "Employee@123";
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const employee = await prisma.user.upsert({
    where: { email: "employee@productivitytracker.com" },
    update: {
      name: "Demo Employee",
      password: hashedPassword,
      role: "EMPLOYEE",
      isActive: true,
    },
    create: {
      name: "Demo Employee",
      email: "employee@productivitytracker.com",
      password: hashedPassword,
      role: "EMPLOYEE",
      isActive: true,
    },
  });

  const sampleTitles = [
    "Prepare weekly report",
    "Implement login audit log",
    "Refactor task listing endpoint",
  ];

  await prisma.task.deleteMany({
    where: {
      assignedToId: employee.id,
      title: {
        in: sampleTitles,
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Prepare weekly report",
        description: "Compile completed tasks and progress summary for this week.",
        expectedDuration: 120,
        actualDuration: 95,
        productivity: 91.5,
        status: "COMPLETED",
        assignedToId: employee.id,
      },
      {
        title: "Implement login audit log",
        description: "Track login attempts with timestamp and employee id.",
        expectedDuration: 180,
        actualDuration: 0,
        productivity: null,
        status: "IN_PROGRESS",
        assignedToId: employee.id,
      },
      {
        title: "Refactor task listing endpoint",
        description: "Improve query performance and response payload consistency.",
        expectedDuration: 90,
        actualDuration: 0,
        productivity: null,
        status: "ASSIGNED",
        assignedToId: employee.id,
      },
    ],
  });

  console.log("Seeded employee:");
  console.log("email: employee@productivitytracker.com");
  console.log("password: Employee@123");
  console.log("Seeded 3 sample tasks for employee.");
};

try {
  await seedMasterData();
  await seedEmployee();
} catch (error) {
  console.error("Seeding failed:", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
