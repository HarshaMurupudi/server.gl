import express, { Request, Response } from "express";

import { getNextDate } from "../../utils";
const { glDB } = require("../../config/database");

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

router.get("/jobsByVendor/:vendorName", async (req, res) => {
  try {
    const { vendorName } = req.params;

    const jobs = await glDB.query(
      `
            SELECT * FROM [Production].[dbo].[Job_Operation] 
            WHERE Job IN 
            (
              SELECT DISTINCT(Job) FROM [Production].[dbo].[Job] 
              WHERE Status IN ('Active', 'Hold', 'Complete', 'Pending'
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
      const sortedJobs = jobsWithData.sort(compare);
      if (sortedJobs[0] && sortedJobs[0]["WC_Vendor"] == vendorName) {
        jobIds.push(job);
      }
    }

    const fJobs = await glDB.query(
      `
          SELECT *
          FROM (
            SELECT j.[Job], [Part_Number], [Customer], j.[Status], j.[Description], [Order_Quantity], [Completed_Quantity], [Released_Date], 
            j.Sched_Start, j.Make_Quantity, j.Note_Text, j.Sales_Code, jo.Work_Center, j.Rev,
            jo.WC_Vendor, jo.Sequence,
            del.Promised_Date,
            Plan_Notes, t3.Priority,
            ROW_NUMBER() OVER (PARTITION BY
            j.Job ORDER BY j.Sched_Start) AS row_number,
            jo.Est_Total_Hrs,
            del.DeliveryKey,
            jo.Job_OperationKey,
            j.Lead_Days,
            j.Customer_PO, j.Top_Lvl_Job
            FROM [dbo].[Job] AS j
            LEFT JOIN [dbo].[Job_Operation] jo on j.Job = jo.Job
            LEFT JOIN 
                  (SELECT Job, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery] WHERE Packlist IS NULL) 
                  AS del ON j.Job = del.Job
            LEFT JOIN
            (SELECT * FROM [General_Label].[dbo].[Vendor_Notes] ) AS t3 
            ON 
              jo.Job = t3.Job
              AND jo.Job_OperationKey = t3.Job_OperationKey
            WHERE j.[Job] IN (:jobIDs) AND jo.WC_Vendor = :vendor
          ) AS t
            WHERE t.row_number = 1;
          `,
      {
        replacements: {
          jobIDs: jobIds,
          vendor: vendorName,
        },
      }
    );

    for (const job of fJobs[0]) {
      if (!job["Promised_Date"]) {
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
          job["Promised_Date"] = getNextDate(rootJobDel[0], "Promised_Date")[
            "Promised_Date"
          ];
        }
      }
    }

    res.status(200).json({
      status: "success",
      results: fJobs[0].length,
      jobs: fJobs[0],
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

router.get("/vendor/open/:vendorName", async (req, res) => {
  try {
    const { vendorName } = req.params;

    const jobs = await glDB.query(
      `
          select 
            j.Job, j.Customer, Part_Number, j.Status, j.Description, 
            j.Sched_Start, j.Make_Quantity, j.Note_Text,
            j.Sales_Code, jo.Work_Center, jo.Status, jo.Sequence, j.Rev,
            jo.WC_Vendor,
            del.Promised_Date,
            j.Lead_Days,
            Plan_Notes, t3.Priority,
            (del.Promised_Date - j.Lead_Days) AS Ship_By_Date,
            jo.Est_Total_Hrs,
            del.DeliveryKey,
            jo.Job_OperationKey,
            j.Lead_Days,
            j.Customer_PO, j.Top_Lvl_Job
          from [Production].[dbo].[Job] as j
          left join
          (select * from [Production].[dbo].[Job_Operation] where Status in  ('O', 'S')) as jo
          on j.Job = jo.Job
          LEFT JOIN 
            (SELECT Job, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery] WHERE Packlist IS NULL) 
            AS del ON j.Job = del.Job
          LEFT JOIN
          (SELECT * FROM [General_Label].[dbo].[Vendor_Notes] ) AS t3 
          ON 
            jo.Job = t3.Job
            AND jo.Job_OperationKey = t3.Job_OperationKey
            AND jo.Vendor = t3.Vendor
            AND (del.DeliveryKey = t3.DeliveryKey OR (del.DeliveryKey IS NULL AND t3.DeliveryKey IS NULL))
          where 
          j.status in ('Active','Hold', 'Pending', 'Complete') 
          AND 
          jo.WC_Vendor = :vendor;
        `,
      {
        replacements: {
          vendor: vendorName,
        },
      }
    );

    for (const job of jobs[0]) {
      const jobsWithData = jobs[0].filter((iJob) => {
        return iJob.Job == job.Job;
      });

      const sortedJobs = jobsWithData.sort(compare);
      if (sortedJobs.length > 0) {
        job["Now At"] = sortedJobs[0]["WC_Vendor"];
      }

      if (!job["Promised_Date"]) {
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
          job["Promised_Date"] = getNextDate(rootJobDel[0], "Promised_Date")[
            "Promised_Date"
          ];
        }
      }
    }

    res.status(200).json({
      status: "success",
      results: jobs[0].length,
      jobs: jobs[0],
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

module.exports = router;
