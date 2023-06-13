import express, { Request, Response } from 'express';
import fs from 'fs';
const Job = require('../models/Job');
const router = express.Router();
const { glDB } = require('../config/database');

router.get('/', async (req: Request, res: Response) => {
  try {
    const jobs = await Job.findAll({ limit: 50 });
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

    var isWin = process.platform === 'win32';

    const filePath = isWin
      ? `\\\\gl-fs01\\GLIParts\\${partID}\\Current\\Prints\\Image\\`
      : `//gl-fs01/GLIParts/${partID}/Current/Prints/Image/`;

    const fileName = fs.readdirSync(filePath)[0];

    if (fileName) {
      res.download(filePath + fileName);
    } else {
      alert('No file');
    }
  } catch (error: any) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

module.exports = router;
