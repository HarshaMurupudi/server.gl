import express, { Request, Response } from 'express';
import fs from 'fs';

const Job = require('../models/Job');
const Operation = require("../models/Operation");
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
        SELECT Job, SUM(On_Hand_Qty) AS Distinct_On_Hand_Qty, 
        MAX([Notes]) AS Notes, MAX(Part_Number) AS Part_Number, 
        MAX(On_Hand_Qty) AS On_Hand_Qty, MAX(Customer) AS Customer, 
        MAX(Status) AS Status, MAX(Description) AS Description, 
        MAX(Order_Quantity) AS Order_Quantity, MAX(Completed_Quantity) AS Completed_Quantity, 
        MAX(CAST(Promised_Date as date)) AS Promised_Date, 
        MAX(CAST(Requested_Date as date)) AS Requested_Date, 
        MAX(CAST((Ship_By_Date) AS date)) AS Ship_By_Date
        FROM 
        (SELECT DISTINCT (t1.Job), t3.[Notes], Part_Number, t4.On_Hand_Qty, t4.Location_ID, Customer, Status, Description, Order_Quantity, Completed_Quantity, CAST(Promised_Date as date) AS Promised_Date, CAST(Requested_Date as date) AS Requested_Date, CAST((Promised_Date - Lead_Days) AS date) AS Ship_By_Date
            FROM [Production].[dbo].[Job] AS t1 INNER JOIN ( SELECT Job, Promised_Date, Requested_Date FROM [Production].[dbo].[Delivery]
              WHERE Packlist IS NULL AND Remaining_Quantity > 0 ) AS t2 ON t1.Job = t2.Job
              INNER JOIN ( SELECT * FROM  [Production].[dbo].[Material_Location]) AS t4 ON t1.Part_Number = t4.Material
              LEFT JOIN( SELECT * FROM [General_Label].[dbo].[Notes_Final] ) AS t3 ON t1.Job = t3.Job
              WHERE Status IN ('Active', 'Complete', 'Hold', 'Pending')) a
        GROUP BY Job;
      `
    );

    let setOfJobs = [...new Set(jobs[0].map((cJob: any) => cJob.Job))];

    const fJobs = await Operation.findAll({
      where: {
        Job: setOfJobs,
      },
    });

    for (const job of jobs[0]) {
      const jobsWithData = fJobs.filter((iJob: any) => {
        return iJob.Job == job.Job;
      });
      const filteredJobs = jobsWithData.filter(
        (fJob: any) => fJob.Status === 'S' || fJob.Status === 'O'
      );

      const sortedJobs = filteredJobs.sort(compare);
      if (sortedJobs.length > 0) {
        job['Now At'] = sortedJobs[0]['Work_Center'];
      }
    }

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
          WHERE Job IN 
          (
            SELECT DISTINCT(Job) FROM [Production].[dbo].[Job] 
            WHERE Status IN ('Active', 'Hold', 'Complete', 'Pending'
          ));
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

      const fJobs = await glDB.query(
        `
        SELECT j.[Job], [Part_Number], [Customer], j.[Status], j.[Description], [Order_Quantity], [Completed_Quantity], [Released_Date], 
        j.Sched_Start, j.Make_Quantity, jo.Note_Text, j.Sales_Code, jo.Work_Center
        FROM [dbo].[Job] AS j
        LEFT JOIN [dbo].[Job_Operation] jo on j.Job = jo.Job
        WHERE j.[Job] IN (N'179079', N'PC835 .020 VMPC', N'179863A', N'179964');
        `
      );
      res.status(200).json({
        status: 'success',
        results: fJobs[0].length,
        jobs: fJobs[0],
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
        select j.Job, j.Customer, Part_Number, j.Status, j.Description, j.Sched_Start, j.Make_Quantity, jo.Note_Text, j.Sales_Code, jo.Work_Center, jo.Status, jo.Sequence 
        from [Production].[dbo].[Job] as j
        inner join(select * from [Production].[dbo].[Job_Operation] where Status in  ('O', 'S')) as jo
        on j.Job = jo.Job where j.status in ('Active','Hold', 'Pending', 'Complete') AND jo.Work_Center = 'A-ART';
      `
    );

    for (const job of jobs[0]) {
      const jobsWithData = jobs[0].filter((iJob: any) => {
        return iJob.Job == job.Job;
      });

      const sortedJobs = jobsWithData.sort(compare);
      if (sortedJobs.length > 0) {
        job['Now At'] = sortedJobs[0]['Work_Center'];
      }
    }

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

router.get('/job-details/:jobID', async (req: Request, res: Response) => {
  try {
    const { jobID } = req.params;
    const jobs = await glDB.query(
      `
      SELECT DISTINCT (t1.Job), t3.[Notes], Part_Number, t4.On_Hand_Qty, t4.Location_ID, Customer, Status, Description, Order_Quantity, Completed_Quantity, 
      CAST(Promised_Date as date) AS Promised_Date, CAST(Requested_Date as date) AS Requested_Date, 
      CAST((Promised_Date - Lead_Days) AS date) AS Ship_By_Date FROM [Production].[dbo].[Job] AS t1 
      INNER JOIN ( SELECT Job, Promised_Date, Requested_Date FROM [Production].[dbo].[Delivery] WHERE Packlist IS NULL 
      AND Remaining_Quantity > 0 ) AS t2 ON t1.Job = t2.Job INNER JOIN ( SELECT * FROM  [Production].[dbo].[Material_Location]) AS t4 ON t1.Part_Number = t4.Material 
      LEFT JOIN( SELECT * FROM [General_Label].[dbo].[Notes_Final] ) AS t3 ON t1.Job = t3.Job WHERE Status IN ('Active', 'Complete', 'Hold', 'Pending') AND t1.Job = :jobID  ORDER BY Ship_By_Date ASC;
      `,
      {
        replacements: {
          jobID
        },
        type: glDB.QueryTypes.SELECT
      }
    );

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      jobs: jobs,
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
