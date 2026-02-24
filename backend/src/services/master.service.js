import { prisma } from '../config/prisma.js';

export const getMasterActivities = async () => {
  try {
    const activities = await prisma.activity.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const getMasterProcesses = async () => {
  try {
    const processes = await prisma.process.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return processes;
  } catch (error) {
    console.error('Error fetching processes:', error);
    throw error;
  }
};

export const getMasterSubProcesses = async () => {
  try {
    const subProcesses = await prisma.subProcess.findMany({
      select: {
        id: true,
        name: true,
        processId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return subProcesses;
  } catch (error) {
    console.error('Error fetching sub processes:', error);
    throw error;
  }
};

export const getMasterJobTypes = async () => {
  try {
    const jobTypes = await prisma.jobType.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return jobTypes;
  } catch (error) {
    console.error('Error fetching job types:', error);
    throw error;
  }
};
