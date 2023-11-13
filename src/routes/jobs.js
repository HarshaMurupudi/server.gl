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
          DeliveryKey,
          Sales_Code,
          Note_Text,
          Floor_Notes,
          Unit_Price,
          Ship_Via,
          Shipped_Quantity,
          Quote
        FROM 
        (
          SELECT DISTINCT 
            (t1.Job), t3.[Production_Notes], t3.[Sales_Notes],
            t1.Customer_PO, t1.Unit_Price, t1.Ship_Via, t1.Shipped_Quantity, t1.Quote,
            cast (t1.Note_Text as nvarchar(max)) as Note_Text,
            cast (t1.Floor_Notes) as nvarchar(max)) as Floor_Notes,
            t3.[Engineering_Notes], 
            t3.[Job_Plan], Part_Number, Customer, Status, Description, Order_Quantity, Promised_Quantity,
            Completed_Quantity, Promised_Date, t1.Sales_Code,
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
            WHERE Status IN ('Active', 'Complete')
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

    // let setOfJobs = [...new Set(jobs[0].map((cJob) => cJob.Job))];
    // const fJobs = await Operation.findAll({
    //   where: {
    //     Job: setOfJobs,
    //   },
    // });

    // for (const job of jobs[0]) {
    //   const jobsWithData = fJobs.filter((iJob) => {
    //     return iJob.Job == job.Job;
    //   });

    //   const filteredJobs = jobsWithData.filter(
    //     (fJob) => fJob.Status === "S" || fJob.Status === "O"
    //   );

    //   const filteredCompletedJobs = jobsWithData.filter(
    //     (fJob) => fJob.Status === "C"
    //   );

    //   const sortedCompletedJobs = filteredCompletedJobs.sort(compare);
    //   const sortedJobs = filteredJobs.sort(compare);

    //   if (sortedJobs.length > 0) {
    //     job["Now At"] = sortedJobs[0]["Work_Center"];
    //   }

    //   if (job["Status"] === "Complete" && sortedCompletedJobs.length > 0) {
    //     job["Now At"] =
    //       sortedCompletedJobs[sortedCompletedJobs.length - 1]["Work_Center"];
    //   }
    // }

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

router.get("/now-at", async (req, res) => {
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
          DeliveryKey,
          Sales_Code,
          Note_Text,
          Floor_Notes,
          Unit_Price,
          Ship_Via,
          Shipped_Quantity,
          Quote
        FROM 
        (
          SELECT DISTINCT 
            (t1.Job), t3.[Production_Notes], t3.[Sales_Notes],
            t1.Customer_PO, t1.Unit_Price, t1.Ship_Via, t1.Shipped_Quantity, t1.Quote,
            cast (t1.Note_Text as nvarchar(max)) as Note_Text,
            cast (t1.Floor_Notes) as nvarchar(max)) as Floor_Notes,
            t3.[Engineering_Notes], 
            t3.[Job_Plan], Part_Number, Customer, Status, Description, Order_Quantity, Promised_Quantity,
            Completed_Quantity, Promised_Date, t1.Sales_Code,
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
            WHERE Status IN ('Active', 'Complete')
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

    const queriesPartList = [];
    for (const job of jobs[0]) {
      // for all jobs get on hand quantity and sum
      // if material has value don't

      if (!queriesPartList.includes(job.Part_Number)) {
        const parts = await glDB.query(
          `
          SELECT 
          LOC.Material, Location_ID, Lot, On_Hand_Qty, Deferred_Qty AS Allocated_Qty, MAT.Description, mr.Job FROM [Production].[dbo].[Material_Location] AS LOC
          INNER JOIN
          (SELECT Description, Material FROM [Production].[dbo].[Material]) AS MAT
          ON LOC.Material = MAT.Material
          LEFT JOIN
          (SELECT * FROM [Production].[dbo].[Material_Req] WHERE Deferred_Qty > 0) AS mr
          ON LOC.Material = mr.Material
          WHERE LOC.Material LIKE :partID + '%';
          `,
          {
            replacements: {
              partID: job.Part_Number,
            },
            type: glDB.QueryTypes.SELECT,
          }
        );

        const total = parts.reduce((sum, item) => {
          sum = sum + item.On_Hand_Qty;
          return sum;
        }, 0);
        queriesPartList.push(job.Part_Number);
        job.On_Hand_Qty = total;
      }

      const jobsWithData = fJobs.filter((iJob) => {
        return iJob.Job == job.Job;
      });

      const filteredJobs = jobsWithData.filter(
        (fJob) => fJob.Status === "S" || fJob.Status === "O"
      );

      const filteredCompletedJobs = jobsWithData.filter(
        (fJob) => fJob.Status === "C"
      );

      const sortedCompletedJobs = filteredCompletedJobs.sort(compare);
      const sortedJobs = filteredJobs.sort(compare);

      if (sortedJobs.length > 0) {
        job["Now At"] = sortedJobs[0]["Work_Center"];
      }

      if (job["Status"] === "Complete" && sortedCompletedJobs.length > 0) {
        job["Now At"] =
          sortedCompletedJobs[sortedCompletedJobs.length - 1]["Work_Center"];
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

router.get("/part-number/:partID", async (req, res) => {
  try {
    const { partID: partValue } = req.params;
    const partID = partValue.split("_")[0];
    var isWin = process.platform === "win32";

    const filePath = isWin
      ? `\\\\gl-fs01\\GLIParts\\${partID}\\Current\\Prints\\Image\\`
      : `//gl-fs01/GLIParts/${partID}/Current/Prints/Image/`;

    // const fileName =
    //   fs.readdirSync(filePath)[0] == ".DS_Store"
    //     ? fs.readdirSync(filePath)[1]
    //     : fs.readdirSync(filePath)[0];

    const allFiles = fs.readdirSync(filePath);
    const pdf = allFiles.filter(
      (name) => name.includes(".pdf") && !name.startsWith(".")
    );

    const fileName = pdf;

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
      code: error.code,
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
      code: error.code,
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
            // Packlist: null,
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

router.get("/delivery/shiplines", async (req, res) => {
  try {
    // const jobs = [await Job.findAll({ limit: 50 })];

    const { job } = req.query;

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
          DeliveryKey,
          Sales_Code,
          Note_Text,
          Floor_Notes
          Unit_Price,
          Ship_Via,
          Shipped_Quantity,
          Quote
        FROM 
        (
          SELECT DISTINCT 
            (t1.Job), t3.[Production_Notes], t3.[Sales_Notes],
            t1.Customer_PO, t1.Unit_Price, t1.Ship_Via, t1.Shipped_Quantity, t1.Quote,
            cast (t1.Note_Text as nvarchar(max)) as Note_Text,
            cast (t1.Floor_Notes) as nvarchar(max)) as Floor_Notes,
            t3.[Engineering_Notes], 
            t3.[Job_Plan], Part_Number, Customer, Status, Description, Order_Quantity, Promised_Quantity,
            Completed_Quantity, Promised_Date, t1.Sales_Code,
            Requested_Date, (Promised_Date - Lead_Days - 2) AS Ship_By_Date, Lead_Days, Rev, U.Text5, t2.DeliveryKey
          FROM [Production].[dbo].[Job] AS t1           
            INNER JOIN 
            (SELECT Job, Promised_Date, Requested_Date, Promised_Quantity, DeliveryKey FROM [Production].[dbo].[Delivery]) 
            AS t2 ON t1.Job = t2.Job
            LEFT JOIN
            (SELECT Text5, User_Values AS U_User_Values  FROM [Production].[dbo].[User_Values]) AS u 
              ON t1.User_Values = u.U_User_Values
            LEFT JOIN
            (SELECT * FROM [General_Label].[dbo].[Delivery_Notes] ) AS t3 
              ON t1.Job = t3.Job 
              AND (t2.DeliveryKey = t3.DeliveryKey
              OR (t2.DeliveryKey IS NULL AND t3.DeliveryKey IS NULL))
            WHERE Status IN ('Active', 'Complete')
            ) a
        WHERE Job= :job
        ORDER BY Ship_By_Date;
      `,
      {
        replacements: {
          job,
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

      const filteredCompletedJobs = jobsWithData.filter(
        (fJob) => fJob.Status === "C"
      );

      const sortedCompletedJobs = filteredCompletedJobs.sort(compare);
      const sortedJobs = filteredJobs.sort(compare);

      if (sortedJobs.length > 0) {
        job["Now At"] = sortedJobs[0]["Work_Center"];
      }

      if (job["Status"] === "Complete" && sortedCompletedJobs.length > 0) {
        job["Now At"] =
          sortedCompletedJobs[sortedCompletedJobs.length - 1]["Work_Center"];
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
