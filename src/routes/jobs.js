import express, { Request, Response } from 'express';
import fs from 'fs';

const Job = require('../models/Job');
const Operation = require("../models/Operation");
const router = express.Router();
const { glDB } = require('../config/database');

function compare(a, b) {
  if (a.Sequence < b.Sequence) {
    return -1;
  }
  if (a.Sequence > b.Sequence) {
    return 1;
  }
  return 0;
}

router.get('/', async (req, res) => {
  try {
    // const jobs = [await Job.findAll({ limit: 50 })];

    const { startDate = new Date, endDate= '' } = req.query;

   
    var sdtzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    var sd = new Date(startDate);
    var sdlocalISOTime = new Date(sd - sdtzoffset)
      .toISOString()
      .slice(0, -1);
    

    const sdfDate = sdlocalISOTime.split('T')[0];

    var edtzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    var ed = new Date(endDate);
    var edlocalISOTime = new Date( ed - edtzoffset)
      .toISOString()
      .slice(0, -1);

    const edfDate = edlocalISOTime.split('T')[0];

    const jobs = await glDB.query(
      `
        SELECT 
          Job,
          Production_Notes,
          Sales_Notes,
          Engineering_Notes,
          Job_Plan,
          Part_Number,
          Customer,
          Status, 
          Description,
          Order_Quantity,
          Completed_Quantity,
          Promised_Date,
          Requested_Date,
          Ship_By_Date,
          Lead_Days
        FROM 
        (SELECT DISTINCT (t1.Job), t3.[Production_Notes], t3.[Sales_Notes],
        t3.[Engineering_Notes], 
        t3.[Job_Plan], Part_Number, Customer, Status, Description, Order_Quantity, 
        Completed_Quantity, Promised_Date, 
         Requested_Date, (Promised_Date - Lead_Days) AS Ship_By_Date, Lead_Days
            FROM [Production].[dbo].[Job] AS t1           
            INNER JOIN 
            (SELECT Job, Promised_Date, Requested_Date FROM [Production].[dbo].[Delivery]
              WHERE Packlist IS NULL) AS t2 ON t1.Job = t2.Job
            LEFT JOIN
            (SELECT * FROM [General_Label].[dbo].[Notes_Final] ) AS t3 ON t1.Job = t3.Job AND (Promised_Date - Lead_Days) = t3.Ship_By_Date
            LEFT JOIN (SELECT * FROM  [Production].[dbo].[Material_Location]) AS t4 ON t1.Part_Number = t4.Material
            WHERE Status IN ('Active', 'Complete', 'Hold', 'Pending')
            ) a
        WHERE Ship_By_Date between :startDate and :endDate
        ORDER BY Ship_By_Date;
      `, {
        replacements: {
          startDate: sdfDate, endDate: edfDate
        }
      }
    );

    let setOfJobs = [...new Set(jobs[0].map((cJob) => cJob.Job))];
    const fJobs = await Operation.findAll({
      where: {
        Job: setOfJobs,
      },
    });

    for (const job of jobs[0]) {
      const jobsWithData = fJobs.filter((iJob) => {
        return iJob.Job == job.Job;
      });
      const filteredJobs = jobsWithData.filter(
        (fJob) => fJob.Status === 'S' || fJob.Status === 'O'
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
  } catch (error) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

router.get('/part-number/:partID', async (req, res) => {
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
  } catch (error) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

router.get('/job-image/:jobID', async (req, res) => {
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
  } catch (error) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    // const { jobID, partID } = req.query;

    const jobs = await Job.findAll({ where: req.query });

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      jobs,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

router.get('/jobs/pending', async (req, res) => {
  try {
    const jobs = await Job.findAll({ where: { Status: 'Pending' } });

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      jobs,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

router.get(
  '/jobsByWorkCenter/:workCenterName',
  async (req, res) => {
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
      let setOfJobs = [...new Set(jobs[0].map((cJob) => cJob.Job))];

      for (const job of setOfJobs) {
        const jobsWithData = jobs[0].filter((iJob) => {
          return iJob.Job == job;
        });
        const filteredJobs = jobsWithData.filter(
          (fJob) => fJob.Status === 'S' || fJob.Status === 'O'
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
    } catch (error) {
      console.log(error);
      res.status(400).json({
        status: 'Error',
        message: error.message,
      });
    }
  }
);

router.get('/jobs/open', async (req, res) => {
  try {
    const { workCenterName } = req.params;

    // const jobs = [await Job.findAll({ limit: 5 })];

    const jobs = await glDB.query(
      `
        select 
          j.Job, j.Customer, Part_Number, j.Status, j.Description, 
          j.Sched_Start, j.Make_Quantity, jo.Note_Text,
          j.Sales_Code, jo.Work_Center, jo.Status, jo.Sequence 
        from [Production].[dbo].[Job] as j
        inner join
        (select * from [Production].[dbo].[Job_Operation] where Status in  ('O', 'S')) as jo
        on j.Job = jo.Job 
        where 
        j.status in ('Active','Hold', 'Pending', 'Complete') 
        AND 
        jo.Work_Center = 'A-ART';
      `
    );

    for (const job of jobs[0]) {
      const jobsWithData = jobs[0].filter((iJob) => {
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
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

router.get('/job-details/:jobID', async (req, res) => {
  try {
    const { jobID } = req.params;
    const jobs = await glDB.query(
      `
      SELECT DISTINCT (t1.Job), Part_Number, t4.On_Hand_Qty, t4.Location_ID, Customer, Status, Description, Order_Quantity, Completed_Quantity, 
      CAST(Promised_Date as date) AS Promised_Date, CAST(Requested_Date as date) AS Requested_Date, 
      CAST((Promised_Date - Lead_Days) AS date) AS Ship_By_Date FROM [Production].[dbo].[Job] AS t1 
      INNER JOIN ( SELECT Job, Promised_Date, Requested_Date FROM [Production].[dbo].[Delivery] WHERE Packlist IS NULL 
      ) AS t2 ON t1.Job = t2.Job INNER JOIN ( SELECT * FROM  [Production].[dbo].[Material_Location]) AS t4 ON t1.Part_Number = t4.Material 
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
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

module.exports = router;
