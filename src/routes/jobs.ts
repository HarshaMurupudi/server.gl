import express, { Request, Response } from 'express';
import fs from 'fs';
const Job = require('../models/Job');
const router = express.Router();
const { glDB } = require('../config/database');

router.get('/', async (req: Request, res: Response) => {
  try {
    const jobs = await Job.findAll({ limit: 5 });
    res.status(200).json({
      status: 'success',
      results: jobs.length,
      jobs,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

router.get('/part-number/:partID', async (req: Request, res: Response) => {
  try {
    const { partID } = req.params;

    // const filePath = '\\\\servername\\path\\Test.pdf';
    const filePath =
      '/Users/harsha/Documents/Resume/Full-time/v2/Sriharsha Murupudi - Resume.pdf';

    res.download(filePath);

    console.log(partID);
  } catch (error: any) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

module.exports = router;
