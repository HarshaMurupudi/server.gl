import express, { Request, Response } from 'express';
import fs from 'fs';

const Job = require('../models/Job');
const router = express.Router();
const { glDB } = require('../config/database');

function compare(a: any, b: any) {
  if (a.Sequence < b.Sequence) {
    return -1;
  }
  if (a.Sequence > b.Sequence) {
    return 1;
  }
  return 0;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    // const jobs = [await Job.findAll({ limit: 50 })];

    const jobs = await glDB.query(
      `
SELECT * FROM 
(SELECT DISTINCT (t1.Job), t3.[Notes], Part_Number, t4.On_Hand_Qty, t4.Location_ID, Customer, Status, Description, Order_Quantity, Completed_Quantity, CAST(Promised_Date as date) AS Promised_Date, CAST(Requested_Date as date) AS Requested_Date, CAST((Promised_Date - Lead_Days) AS date) AS Ship_By_Date
    FROM [Production].[dbo].[Job] AS t1 INNER JOIN ( SELECT Job, Promised_Date, Requested_Date FROM [Production].[dbo].[Delivery]
      WHERE Packlist IS NULL AND Remaining_Quantity > 0 ) AS t2 ON t1.Job = t2.Job
      INNER JOIN ( SELECT * FROM  [Production].[dbo].[Material_Location]) AS t4 ON t1.Part_Number = t4.Material
      LEFT JOIN( SELECT * FROM [General_Label].[dbo].[Notes_Final] ) AS t3 ON t1.Job = t3.Job
      WHERE Status IN ('Active', 'Complete', 'Hold', 'Pending')) a
LEFT JOIN
(select * from
(
select *
, ROW_NUMBER() OVER(PARTITION BY Job ORDER BY Sequence) AS row
from [dbo].[Job_Operation] WHERE Status = 'S' OR Status = 'C'
) as a
where row = 1) b
ON a.Job = b.Job ORDER BY Ship_By_Date ASC;
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

router.get('/job-image/:jobID', async (req: Request, res: Response) => {
  try {
    const { jobID } = req.params;

    const selectedJob = await Job.findOne({ where: { Job: jobID } });
    const partID = selectedJob.Part_Number;

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
    // const { jobID, partID } = req.query;

    const jobs = await Job.findAll({ where: req.query });

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

router.get('/jobs/pending', async (req: Request, res: Response) => {
  try {
    const jobs = await Job.findAll({ where: { Status: 'Pending' } });

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

router.get(
  '/jobsByWorkCenter/:workCenterName',
  async (req: Request, res: Response) => {
    try {
      const { workCenterName } = req.params;

      const jobs = await glDB.query(
        `
          SELECT * FROM [Production].[dbo].[Job_Operation] 
          WHERE Job IN (
          SELECT DISTINCT(Job) FROM [Production].[dbo].[Job] 
          WHERE Status IN ('Active', 'Hold', 'Complete', 'Pending')
          );
        `
      );

      let jobIds = [];
      let setOfJobs = [...new Set(jobs[0].map((cJob: any) => cJob.Job))];

      for (const job of setOfJobs) {
        const jobsWithData = jobs[0].filter((iJob: any) => {
          return iJob.Job == job;
        });
        const filteredJobs = jobsWithData.filter(
          (fJob: any) => fJob.Status === 'S' || fJob.Status === 'O'
        );
        const sortedJobs = filteredJobs.sort(compare);
        if (sortedJobs[0] && sortedJobs[0]['Work_Center'] == 'A-ART') {
          jobIds.push(job);
        }
      }

      const fJobs = await Job.findAll({
        where: {
          Job: jobIds,
        },
      });
      res.status(200).json({
        status: 'success',
        results: fJobs.length,
        jobs: fJobs,
      });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({
        status: 'Error',
        message: error.message,
      });
    }
  }
);

router.get('/jobs/open', async (req: Request, res: Response) => {
  try {
    const { workCenterName } = req.params;

    // const jobs = [await Job.findAll({ limit: 5 })];

    const jobs = await glDB.query(
      `
    select distinct j.Job, Part_Number, j.Status, j.Description from [Production].[dbo].[Job] as j
    inner join(select * from [Production].[dbo].[Job_Operation] where Status in  ('O', 'S')) as jo
    on j.Job = jo.Job where j.status in ('Active','Hold', 'Pending', 'Complete');
        `
    );

    res.status(200).json({
      status: 'success',
      results: jobs[0].length,
      jobs: jobs[0],
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
