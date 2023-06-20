import express, { Request, Response } from 'express';
import fs from 'fs';
const Job = require('../models/Job');
const router = express.Router();
const { glDB } = require('../config/database');

router.get('/', async (req: Request, res: Response) => {
  try {
    // const jobs = [await Job.findAll({ limit: 50 })];

    const jobs = await glDB.query(
      `
    SELECT DISTINCT (t1.Job), t3.[Notes], Part_Number, t4.On_Hand_Qty, t4.Location_ID, Customer, Status, Description, Order_Quantity, Completed_Quantity, CAST(Promised_Date as date) AS Promised_Date, CAST(Requested_Date as date) AS Requested_Date, CAST((Promised_Date - Lead_Days) AS date) AS Ship_By_Date
    FROM [Production].[dbo].[Job] AS t1 INNER JOIN ( SELECT Job, Promised_Date, Requested_Date FROM [Production].[dbo].[Delivery]
      WHERE Packlist IS NULL AND Remaining_Quantity > 0 ) AS t2 ON t1.Job = t2.Job
      INNER JOIN ( SELECT * FROM  [Production].[dbo].[Material_Location]) AS t4 ON t1.Part_Number = t4.Material
      LEFT JOIN( SELECT * FROM [General_Label].[dbo].[Notes_Final] ) AS t3 ON t1.Job = t3.Job
      WHERE Status IN ('Active', 'Complete', 'Hold', 'Pending') ORDER BY Ship_By_Date ASC;
            `
    );

    res.status(200).json({
      status: 'success',
      results: jobs[0].length,
      jobs: jobs[0],
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
      res.status(400).json({
        status: 'Error',
        message: 'No file',
      });
    }
  } catch (error: any) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { jobID, partID } = req.query;
    let jobs = [];

    console.log(req.query, jobID);

    if (jobID) {
      jobs = await Job.findAll({ where: { Job: jobID } });
    } else {
      jobs = await Job.findAll({ Part_Number: partID });
    }

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      jobs,
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

module.exports = router;
