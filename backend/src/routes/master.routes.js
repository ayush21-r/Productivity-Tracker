import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  getMasterActivities,
  getMasterProcesses,
  getMasterSubProcesses,
  getMasterJobTypes,
} from '../services/master.service.js';

const router = express.Router();

// Get all activities
router.get('/master/activities', verifyToken, async (req, res, next) => {
  try {
    const activities = await getMasterActivities();
    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

// Get all processes
router.get('/master/processes', verifyToken, async (req, res, next) => {
  try {
    const processes = await getMasterProcesses();
    res.status(200).json({
      success: true,
      data: processes,
    });
  } catch (error) {
    next(error);
  }
});

// Get all sub processes
router.get('/master/subprocesses', verifyToken, async (req, res, next) => {
  try {
    const subProcesses = await getMasterSubProcesses();
    res.status(200).json({
      success: true,
      data: subProcesses,
    });
  } catch (error) {
    next(error);
  }
});

// Get all job types
router.get('/master/jobtypes', verifyToken, async (req, res, next) => {
  try {
    const jobTypes = await getMasterJobTypes();
    res.status(200).json({
      success: true,
      data: jobTypes,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
