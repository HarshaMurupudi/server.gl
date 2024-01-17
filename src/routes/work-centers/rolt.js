import express, { Request, Response } from 'express';

import { getNextDate } from '../../utils';
const Operation = require('../../models/Operation');
const { glDB } = require('../../config/database');

const router = express.Router();

function compare(a, b) {
  if (a.Sequence < b.Sequence) {
    return -1;
  }
  if (a.Sequence > b.Sequence) {
    return 1;
  }
  return 0;
}

router.get('/rolt/jobsByWorkCenter/:workCenterName', async (req, res) => {
  try {
    const { workCenterName } = req.params;

    const jobs = await glDB.query(
      `
            SELECT * FROM [Production].[dbo].[Job_Operation] 
            WHERE Job IN 
            (
              SELECT DISTINCT(Job) FROM [Production].[dbo].[Job] 
              WHERE Status IN ('Active', 'Complete'
            ))
            AND Status in  ('O', 'S')
            ;
          `
    );

    let jobIds = [];
    let setOfJobs = [...new Set(jobs[0].map((cJob) => cJob.Job))];

    for (const job of setOfJobs) {
      const jobsWithData = jobs[0].filter((iJob) => {
        return iJob.Job == job;
      });
      // const filteredJobs = jobsWithData.filter(
      //   (fJob) => fJob.Status === 'S' || fJob.Status === 'O'
      // );
      const sortedJobs = jobsWithData.sort(compare);
      if (sortedJobs[0] && sortedJobs[0]['Work_Center'] == workCenterName) {
        jobIds.push(job);
      }
    }

    const fJobs =
      jobIds.length > 0
        ? await glDB.query(
            `
          SELECT *
          FROM (
            SELECT j.[Job], [Part_Number], [Customer], j.[Status], j.[Description], [Order_Quantity], [Completed_Quantity], [Released_Date], 
            j.Sched_Start, j.Make_Quantity, j.Note_Text, j.Sales_Code, jo.Work_Center, j.Rev, j.Quote,
            jo.WC_Vendor, jo.Sequence, jo.Status AS JobOperationStatus,
            del.Promised_Date,
            Plan_Notes, t3.Priority,
            ROW_NUMBER() OVER (PARTITION BY
            j.Job ORDER BY j.Sched_Start) AS row_number,
            jo.Est_Total_Hrs,
            del.DeliveryKey,
            jo.Job_OperationKey,
            j.Lead_Days,
            j.Customer_PO, j.Top_Lvl_Job,
            Colors,
            Print_Pcs,
            Number_Up,
            Press
            FROM [dbo].[Job] AS j
            LEFT JOIN
            (SELECT Amount1 AS Colors, Amount2 AS Print_Pcs, Numeric1 AS Number_Up, Decimal1, User_Values AS U_User_Values, Decimal1 AS Press FROM [Production].[dbo].[User_Values]) AS u 
              ON j.User_Values = u.U_User_Values
            LEFT JOIN [dbo].[Job_Operation] jo on j.Job = jo.Job
            LEFT JOIN 
                  (SELECT Job, Comment, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery] WHERE Packlist IS NULL) 
                  AS del ON j.Job = del.Job
            LEFT JOIN
            (SELECT * FROM [General_Label].[dbo].[Rolt_Notes] ) AS t3 
            ON 
              jo.Job = t3.Job
              AND jo.Job_OperationKey = t3.Job_OperationKey
              AND jo.Work_Center = t3.Work_Center
              AND (del.DeliveryKey = t3.DeliveryKey OR (del.DeliveryKey IS NULL AND t3.DeliveryKey IS NULL))
            WHERE j.[Job] IN (:jobIDs) AND jo.Work_Center = :wc
          ) AS t
            WHERE t.row_number = 1;
          `,
            {
              replacements: {
                jobIDs: jobIds,
                wc: workCenterName,
              },
            }
          )
        : [[]];

    for (const job of fJobs[0]) {
      if (!job['Promised_Date']) {
        const rootJobDel = await glDB.query(
          `
                  SELECT * FROM [Production].[dbo].[Delivery] 
                  WHERE Job= :jobID
                `,
          {
            replacements: {
              jobID: job.Top_Lvl_Job,
            },
          }
        );

        if (rootJobDel[0].length > 0) {
          job['Promised_Date'] = getNextDate(rootJobDel[0], 'Promised_Date')[
            'Promised_Date'
          ];
        }
      }
    }

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
});

router.get('/rolt/jobs/open/:workCenterName', async (req, res) => {
  try {
    const { workCenterName } = req.params;

    // const jobs = [await Job.findAll({ limit: 5 })];

    // if()

    const jobs = await glDB.query(
      `
          select 
            j.Job, j.Customer, Part_Number, j.Status, j.Description, 
            j.Sched_Start, j.Make_Quantity, j.Note_Text,
            j.Sales_Code, jo.Work_Center, jo.Status, jo.Sequence, j.Rev, j.Quote,
            jo.WC_Vendor,
            del.Promised_Date,
            j.Lead_Days,
            Plan_Notes, t3.Priority,
            (del.Promised_Date - j.Lead_Days) AS Ship_By_Date,
            jo.Est_Total_Hrs,
            del.DeliveryKey,
            jo.Job_OperationKey,
            j.Lead_Days,
            j.Customer_PO, j.Top_Lvl_Job,
            Colors,
            Print_Pcs,
            Number_Up,
            Press
          from [Production].[dbo].[Job] as j
          LEFT JOIN
          (SELECT Amount1 AS Colors, Amount2 AS Print_Pcs, Numeric1 AS Number_Up, Decimal1, User_Values AS U_User_Values, Decimal1 AS Press FROM [Production].[dbo].[User_Values]) AS u 
            ON j.User_Values = u.U_User_Values
          left join
          (select * from [Production].[dbo].[Job_Operation] where Status in  ('O', 'S')) as jo
          on j.Job = jo.Job
          LEFT JOIN 
            (SELECT Job, Comment, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery] WHERE Packlist IS NULL) 
            AS del ON j.Job = del.Job
          LEFT JOIN
          (SELECT * FROM [General_Label].[dbo].[Rolt_Notes]) AS t3 
          ON 
            jo.Job = t3.Job 
            AND jo.Job_OperationKey = t3.Job_OperationKey
            AND jo.Work_Center = t3.Work_Center
            AND (del.DeliveryKey = t3.DeliveryKey OR (del.DeliveryKey IS NULL AND t3.DeliveryKey IS NULL))
          where 
          j.status in ('Active', 'Complete') 
          AND 
          jo.Work_Center = :wc;
        `,
      {
        replacements: {
          wc: workCenterName,
        },
      }
    );

    // let setOfJobs = [...new Set(jobs[0].map((cJob) => cJob.Job))];
    // const fJobs = await Operation.findAll({
    //   where: {
    //     Job: setOfJobs,
    //   },
    // });

    for (const job of jobs[0]) {
      // const jobsWithData = fJobs.filter((iJob) => {
      //   return iJob.Job == job.Job;
      // });
      // const filteredJobs = jobsWithData.filter(
      //   (fJob) => fJob.Status === "S" || fJob.Status === "O"
      // );
      // const sortedJobs = filteredJobs.sort(compare);

      // if (sortedJobs.length > 0) {
      //   job["Now At"] = sortedJobs[0]["Work_Center"];
      // }

      if (!job['Promised_Date']) {
        const rootJobDel = await glDB.query(
          `
              SELECT * FROM [Production].[dbo].[Delivery] 
              WHERE Job= :jobID
            `,
          {
            replacements: {
              jobID: job.Top_Lvl_Job,
            },
          }
        );

        if (rootJobDel[0].length > 0) {
          job['Promised_Date'] = getNextDate(rootJobDel[0], 'Promised_Date')[
            'Promised_Date'
          ];
        }
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

router.get('/rolt/jobs/open/:workCenterName/now-at', async (req, res) => {
  try {
    const { workCenterName } = req.params;

    // const jobs = [await Job.findAll({ limit: 5 })];

    // if()

    const jobs = await glDB.query(
      `
          select 
            j.Job, j.Customer, Part_Number, j.Status, j.Description, 
            j.Sched_Start, j.Make_Quantity, j.Note_Text,
            j.Sales_Code, jo.Work_Center, jo.Status, jo.Sequence, j.Rev, j.Quote,
            jo.WC_Vendor,
            del.Promised_Date,
            j.Lead_Days,
            Plan_Notes, t3.Priority,
            (del.Promised_Date - j.Lead_Days) AS Ship_By_Date,
            jo.Est_Total_Hrs,
            del.DeliveryKey,
            jo.Job_OperationKey,
            j.Lead_Days,
            j.Customer_PO, j.Top_Lvl_Job,
            Colors,
            Print_Pcs,
            Number_Up,
            Press
          from [Production].[dbo].[Job] as j
          LEFT JOIN
          (SELECT Amount1 AS Colors, Amount2 AS Print_Pcs, Numeric1 AS Number_Up, Decimal1, User_Values AS U_User_Values, Decimal1 AS Press FROM [Production].[dbo].[User_Values]) AS u 
            ON j.User_Values = u.U_User_Values
          left join
          (select * from [Production].[dbo].[Job_Operation] where Status in  ('O', 'S')) as jo
          on j.Job = jo.Job
          LEFT JOIN 
            (SELECT Job, Comment, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery] WHERE Packlist IS NULL) 
            AS del ON j.Job = del.Job
          LEFT JOIN
          (SELECT * FROM [General_Label].[dbo].[Rolt_Notes]) AS t3 
          ON 
            jo.Job = t3.Job 
            AND jo.Job_OperationKey = t3.Job_OperationKey
            AND jo.Work_Center = t3.Work_Center
            AND (del.DeliveryKey = t3.DeliveryKey OR (del.DeliveryKey IS NULL AND t3.DeliveryKey IS NULL))
          where 
          j.status in ('Active', 'Complete') 
          AND 
          jo.Work_Center = :wc;
        `,
      {
        replacements: {
          wc: workCenterName,
        },
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

      if (!job['Promised_Date']) {
        const rootJobDel = await glDB.query(
          `
              SELECT * FROM [Production].[dbo].[Delivery] 
              WHERE Job= :jobID
            `,
          {
            replacements: {
              jobID: job.Top_Lvl_Job,
            },
          }
        );

        if (rootJobDel[0].length > 0) {
          job['Promised_Date'] = getNextDate(rootJobDel[0], 'Promised_Date')[
            'Promised_Date'
          ];
        }
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

module.exports = router;
