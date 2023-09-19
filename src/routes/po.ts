import express, { Request, Response } from "express";
import fs from "fs";
const router = express.Router();

const { glDB } = require("../config/database");

router.get("/po", async (req: Request, res: Response) => {
  try {
    // const { jobID } = req.params;

    const sqlQuery =
      `
    SELECT j.Job, Part_Number, NRE_Charges, 
    Customer_PO, Order_Quantity, Rev, Sched_End, 
    Requested_Date Requested_Date, Promised_Date
    Promised_Date, Promised_Quantity, d.Shipped_Quantity, Remaining_Quantity, Packlist,
    Lead_Days, j.Note_Text
    FROM [Production].[dbo].[Job] AS j  
    LEFT JOIN(SELECT Job, Act_Price AS NRE_Charges 
    FROM [Production].[dbo].[Additional_Charge]) AS ac  
    ON j.Job = ac.Job  
    LEFT JOIN 
    (SELECT *  FROM [Production].[dbo].[Delivery]) AS d ON j.Job = d.Job 
    WHERE ` + Object.keys(req.query)[0];

    const po = await glDB.query(
      `
      ${sqlQuery} =:query;
      `,
      {
        replacements: {
          query: Object.values(req.query)[0],
        },
        type: glDB.QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      status: "success",
      results: po.length,
      po: po,
    });
  } catch (error: any) {
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

router.get("/po-details/:jobID", async (req: Request, res: Response) => {
  try {
    // const { jobID } = req.params;
    const { jobID } = req.params;

    const po = await glDB.query(
      `
      SELECT j.Job, Part_Number, NRE_Charges, 
      Customer_PO, Order_Quantity, Rev, Sched_End, 
      Requested_Date Requested_Date, Promised_Date
      Promised_Date, Promised_Quantity, d.Shipped_Quantity, Remaining_Quantity, Packlist,
      Lead_Days, j.Note_Text
      FROM [Production].[dbo].[Job] AS j  
      LEFT JOIN(SELECT Job, Act_Price AS NRE_Charges 
      FROM [Production].[dbo].[Additional_Charge]) AS ac  
      ON j.Job = ac.Job  
      LEFT JOIN 
      (SELECT *  FROM [Production].[dbo].[Delivery]) AS d ON j.Job = d.Job 
      WHERE j.Job=:jobID
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
      po: po[0],
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

module.exports = router;
