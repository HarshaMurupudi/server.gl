import express, { Request, Response } from "express";
import fs from "fs";
import { Op } from "sequelize";

const JobModel = require("../models/Job");
const Operation = require("../models/Operation");
const Delivery = require("../models/Delivery");
const router = express.Router();
const { glDB } = require("../config/database");

function compare(a, b) {
  if (a.Sequence < b.Sequence) {
    return -1;
  }
  if (a.Sequence > b.Sequence) {
    return 1;
  }
  return 0;
}

router.get("/", async (req, res) => {
  try {
    // const jobs = [await Job.findAll({ limit: 50 })];

    const { startDate = new Date(), endDate = "" } = req.query;

    var sdtzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    var sd = new Date(startDate);
    var sdlocalISOTime = new Date(sd - sdtzoffset).toISOString().slice(0, -1);

    const sdfDate = sdlocalISOTime.split("T")[0];

    var edtzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    var ed = new Date(endDate);
    var edlocalISOTime = new Date(ed - edtzoffset).toISOString().slice(0, -1);

    const edfDate = edlocalISOTime.split("T")[0];

    const jobs = await glDB.query(
      `
        SELECT 
          Job,
          Production_Notes,
          Sales_Notes,
          Engineering_Notes,
          Job_Plan,
          Customer_PO,
          Part_Number,
          Customer,
          Status, 
          Description,
          Order_Quantity,
          Promised_Quantity,
          Completed_Quantity,
          Promised_Date,
          Requested_Date,
          Ship_By_Date,
          Lead_Days,
          Rev,
          Text5,
          DeliveryKey
        FROM 
        (
          SELECT DISTINCT 
            (t1.Job), t3.[Production_Notes], t3.[Sales_Notes],
            t1.Customer_PO,
            t3.[Engineering_Notes], 
            t3.[Job_Plan], Part_Number, Customer, Status, Description, Order_Quantity, Promised_Quantity,
            Completed_Quantity, Promised_Date, 
            Requested_Date, (Promised_Date - Lead_Days - 2) AS Ship_By_Date, Lead_Days, Rev, U.Text5, t2.DeliveryKey
          FROM [Production].[dbo].[Job] AS t1           
            INNER JOIN 
            (SELECT Job, Promised_Date, Requested_Date, Promised_Quantity, DeliveryKey FROM [Production].[dbo].[Delivery]
              WHERE Packlist IS NULL) AS t2 ON t1.Job = t2.Job
            LEFT JOIN
            (SELECT Text5, User_Values AS U_User_Values  FROM [Production].[dbo].[User_Values]) AS u 
              ON t1.User_Values = u.U_User_Values
            LEFT JOIN
            (SELECT * FROM [General_Label].[dbo].[Delivery_Notes] ) AS t3 
              ON t1.Job = t3.Job 
              AND (t2.DeliveryKey = t3.DeliveryKey
              OR (t2.DeliveryKey IS NULL AND t3.DeliveryKey IS NULL))
            WHERE Status IN ('Active', 'Complete', 'Hold', 'Pending')
            ) a
        WHERE Ship_By_Date between :startDate and :endDate
        ORDER BY Ship_By_Date;
      `,
      {
        replacements: {
          startDate: sdfDate,
          endDate: edfDate,
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
        (fJob) => fJob.Status === "S" || fJob.Status === "O"
      );

      const sortedJobs = filteredJobs.sort(compare);
      if (sortedJobs.length > 0) {
        job["Now At"] = sortedJobs[0]["Work_Center"];
      }
    }

    res.status(200).json({
      status: "success",
      results: jobs[0].length,
      jobs: jobs[0],
    });
  } catch (error) {
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

router.get("/part-number/:partID", async (req, res) => {
  try {
    const { partID: partValue } = req.params;
    const partID = partValue.split("_")[0];
    var isWin = process.platform === "win32";

    const filePath = isWin
      ? `\\\\gl-fs01\\GLIParts\\${partID}\\Current\\Prints\\Image\\`
      : `//gl-fs01/GLIParts/${partID}/Current/Prints/Image/`;

    const fileName =
      fs.readdirSync(filePath)[0] == ".DS_Store"
        ? fs.readdirSync(filePath)[1]
        : fs.readdirSync(filePath)[0];

    console.log(fileName, partID, fs.readdirSync(filePath));
    if (fileName) {
      res.download(filePath + fileName);
    } else {
      res.status(400).json({
        status: "Error",
        message: "No file",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

router.get("/job-image/:jobID", async (req, res) => {
  try {
    const { jobID } = req.params;

    const selectedJob = await Job.findOne({ where: { Job: jobID } });
    const partValue = selectedJob.Part_Number;
    const partID = partValue.split("_")[0];
    var isWin = process.platform === "win32";

    const filePath = isWin
      ? `\\\\gl-fs01\\GLIParts\\${partID}\\Current\\Prints\\Image\\`
      : `//gl-fs01/GLIParts/${partID}/Current/Prints/Image/`;

    const fileName = fs.readdirSync(filePath)[0];

    if (fileName) {
      res.download(filePath + fileName);
    } else {
      res.status(400).json({
        status: "Error",
        message: "No file",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

router.get("/jobs", async (req, res) => {
  try {
    const jobs = await JobModel.findAll({
      where: req.query,
      include: [
        {
          model: Delivery,
          required: false,
          where: {
            Packlist: null,
          },
        },
      ],
    });

    res.status(200).json({
      status: "success",
      results: jobs.length,
      jobs,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

router.get("/jobs/pending", async (req, res) => {
  try {
    // const jobs = await Job.findAll({ where: { Status: 'Pending' } });

    const jobs = await glDB.query(
      `
        SELECT *, t2.DeliveryKey, t1.Job, (Promised_Date - Lead_Days) AS Ship_By_Date 
        FROM [Production].[dbo].[Job] AS t1 
        LEFT JOIN
        (
          SELECT Job, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery]
          WHERE Packlist IS NULL
        ) 
        AS t2 ON t1.Job = t2.Job
        LEFT JOIN
        (
          SELECT * FROM [General_Label].[dbo].[Pending_Jobs_Notes] 
        ) 
        AS t3 ON t1.Job = t3.Job AND t2.DeliveryKey = t3.DeliveryKey
        WHERE Status = 'Pending';
      `
    );

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

router.get("/jobsByWorkCenter/:workCenterName", async (req, res) => {
  try {
    const { workCenterName } = req.params;

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
      if (sortedJobs[0] && sortedJobs[0]["Work_Center"] == workCenterName) {
        jobIds.push(job);
      }
    }

    const fJobs = await glDB.query(
      `
        SELECT *
        FROM (
          SELECT j.[Job], [Part_Number], [Customer], j.[Status], j.[Description], [Order_Quantity], [Completed_Quantity], [Released_Date], 
          j.Sched_Start, j.Make_Quantity, jo.Note_Text, j.Sales_Code, jo.Work_Center, j.Rev,
          jo.WC_Vendor,
          del.Promised_Date,
          Plan_Notes, t3.Priority, t3.Assigned_To,
          ROW_NUMBER() OVER (PARTITION BY
          j.Job ORDER BY j.Sched_Start) AS row_number,
          jo.Est_Total_Hrs,
          del.DeliveryKey,
          jo.Job_OperationKey,
          j.Lead_Days
          FROM [dbo].[Job] AS j
          LEFT JOIN [dbo].[Job_Operation] jo on j.Job = jo.Job
          LEFT JOIN 
			    (SELECT Job, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery]) AS del ON j.Job = del.Job
          LEFT JOIN
          (SELECT * FROM [General_Label].[dbo].[Engineering_Notes] ) AS t3 
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
    );

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

router.get("/jobs/open/:workCenterName", async (req, res) => {
  try {
    const { workCenterName } = req.params;

    const jobs = await glDB.query(
      `
        select 
          j.Job, j.Customer, Part_Number, j.Status, j.Description, 
          j.Sched_Start, j.Make_Quantity, jo.Note_Text,
          j.Sales_Code, jo.Work_Center, jo.Status, jo.Sequence, j.Rev,
          jo.WC_Vendor,
          del.Promised_Date,
          j.Lead_Days,
          Plan_Notes, t3.Priority, t3.Assigned_To,
          (del.Promised_Date - j.Lead_Days) AS Ship_By_Date,
          jo.Est_Total_Hrs,
          del.DeliveryKey,
          jo.Job_OperationKey,
          j.Lead_Days
        from [Production].[dbo].[Job] as j
        left join
        (select * from [Production].[dbo].[Job_Operation] where Status in  ('O', 'S')) as jo
        on j.Job = jo.Job
        LEFT JOIN 
        (SELECT Job, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery]) AS del ON j.Job = del.Job
        LEFT JOIN
        (SELECT * FROM [General_Label].[dbo].[Engineering_Notes] ) AS t3 
        ON 
          jo.Job = t3.Job
          AND jo.Job_OperationKey = t3.Job_OperationKey
          AND jo.Work_Center = t3.Work_Center
          AND (del.DeliveryKey = t3.DeliveryKey OR (del.DeliveryKey IS NULL AND t3.DeliveryKey IS NULL))
        where 
        j.status in ('Active','Hold', 'Pending', 'Complete') 
        AND 
        jo.Work_Center = :wc;
      `,
      {
        replacements: {
          wc: workCenterName,
        },
      }
    );

    for (const job of jobs[0]) {
      const jobsWithData = jobs[0].filter((iJob) => {
        return iJob.Job == job.Job;
      });

      const sortedJobs = jobsWithData.sort(compare);
      if (sortedJobs.length > 0) {
        job["Now At"] = sortedJobs[0]["Work_Center"];
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

router.get("/job-details/:jobID", async (req, res) => {
  try {
    const { jobID } = req.params;
    const jobs = await glDB.query(
      `
      SELECT DISTINCT (t1.Job), Part_Number, t4.On_Hand_Qty, t4.Location_ID, Customer, Status, Description, Order_Quantity, Completed_Quantity, 
      CAST(Promised_Date as date) AS Promised_Date, CAST(Requested_Date as date) AS Requested_Date, 
      CAST((Promised_Date - Lead_Days) AS date) AS Ship_By_Date FROM [Production].[dbo].[Job] AS t1 
      INNER JOIN ( SELECT Job, Promised_Date, Requested_Date FROM [Production].[dbo].[Delivery] WHERE Packlist IS NULL 
      ) AS t2 ON t1.Job = t2.Job INNER JOIN ( SELECT * FROM  [Production].[dbo].[Material_Location]) AS t4 ON t1.Part_Number = t4.Material 
      LEFT JOIN( SELECT * FROM [General_Label].[dbo].[Delivery_Notes] ) AS t3 ON t1.Job = t3.Job WHERE Status IN ('Active', 'Complete', 'Hold', 'Pending') AND t1.Job = :jobID  ORDER BY Ship_By_Date ASC;
      `,
      {
        replacements: {
          jobID,
        },
        type: glDB.QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      status: "success",
      results: jobs.length,
      jobs: jobs,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

router.get("/print/jobsByWorkCenter/:workCenterName", async (req, res) => {
  try {
    const { workCenterName } = req.params;

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
      // const filteredJobs = jobsWithData.filter(
      //   (fJob) => fJob.Status === 'S' || fJob.Status === 'O'
      // );
      const sortedJobs = jobsWithData.sort(compare);
      if (sortedJobs[0] && sortedJobs[0]["Work_Center"] == workCenterName) {
        jobIds.push(job);
      }
    }

    const fJobs = await glDB.query(
      `
        SELECT *
        FROM (
          SELECT j.[Job], [Part_Number], [Customer], j.[Status], j.[Description], [Order_Quantity], [Completed_Quantity], [Released_Date], 
          j.Sched_Start, j.Make_Quantity, jo.Note_Text, j.Sales_Code, jo.Work_Center, j.Rev,
          jo.WC_Vendor,
          del.Promised_Date,
          Plan_Notes, t3.Priority,
          ROW_NUMBER() OVER (PARTITION BY
          j.Job ORDER BY j.Sched_Start) AS row_number,
          jo.Est_Total_Hrs,
          del.DeliveryKey,
          jo.Job_OperationKey,
          j.Lead_Days
          FROM [dbo].[Job] AS j
          LEFT JOIN [dbo].[Job_Operation] jo on j.Job = jo.Job
          LEFT JOIN 
			    (SELECT Job, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery]) AS del ON j.Job = del.Job
          LEFT JOIN
          (SELECT * FROM [General_Label].[dbo].[Print_Notes] ) AS t3 
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
    );

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

router.get("/print/jobs/open/:workCenterName", async (req, res) => {
  try {
    const { workCenterName } = req.params;

    // const jobs = [await Job.findAll({ limit: 5 })];

    // if()

    const jobs = await glDB.query(
      `
        select 
          j.Job, j.Customer, Part_Number, j.Status, j.Description, 
          j.Sched_Start, j.Make_Quantity, jo.Note_Text,
          j.Sales_Code, jo.Work_Center, jo.Status, jo.Sequence, j.Rev,
          jo.WC_Vendor,
          del.Promised_Date,
          j.Lead_Days,
          Plan_Notes, t3.Priority,
          (del.Promised_Date - j.Lead_Days) AS Ship_By_Date,
          jo.Est_Total_Hrs,
          del.DeliveryKey,
          jo.Job_OperationKey,
          j.Lead_Days
        from [Production].[dbo].[Job] as j
        left join
        (select * from [Production].[dbo].[Job_Operation] where Status in  ('O', 'S')) as jo
        on j.Job = jo.Job
        LEFT JOIN 
        (SELECT Job, Promised_Date, Requested_Date, DeliveryKey FROM [Production].[dbo].[Delivery]) AS del ON j.Job = del.Job
        LEFT JOIN
        (SELECT * FROM [General_Label].[dbo].[Print_Notes]) AS t3 
        ON 
          jo.Job = t3.Job 
          AND jo.Job_OperationKey = t3.Job_OperationKey
          AND jo.Work_Center = t3.Work_Center
          AND (del.DeliveryKey = t3.DeliveryKey OR (del.DeliveryKey IS NULL AND t3.DeliveryKey IS NULL))
        where 
        j.status in ('Active','Hold', 'Pending', 'Complete') 
        AND 
        jo.Work_Center = :wc;
      `,
      {
        replacements: {
          wc: workCenterName,
        },
      }
    );

    for (const job of jobs[0]) {
      const jobsWithData = jobs[0].filter((iJob) => {
        return iJob.Job == job.Job;
      });

      const sortedJobs = jobsWithData.sort(compare);
      if (sortedJobs.length > 0) {
        job["Now At"] = sortedJobs[0]["Work_Center"];
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

router.get("/jobs/search", async (req, res) => {
  try {
    let query = {
      where: { [req.query.column]: { [Op.like]: req.query.value + "%" } },
      attributes: [req.query.column],
      limit: 6,
    };

    const jobs = await JobModel.findAll(query);
    const flatJobs = [...new Set(jobs.map((item) => item[req.query.column]))];

    res.status(200).json({
      status: "success",
      results: flatJobs.length,
      jobs: flatJobs,
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
