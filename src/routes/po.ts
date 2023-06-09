import express, { Request, Response } from 'express';
import fs from 'fs';
const router = express.Router();

const { glDB } = require('../config/database');

router.get('/po/:jobID', async (req: Request, res: Response) => {
  try {
    const { jobID } = req.params;

    const po = await glDB.query(
      `
      SELECT j.Job, Part_Number, NRE_Charges, 
      Customer_PO, Order_Quantity, Rev, CAST(Sched_End AS date) AS Sched_End, 
      CAST(Requested_Date AS date) Requested_Date, CAST(Promised_Date AS date) 
      Promised_Date, Promised_Quantity, d.Shipped_Quantity, Remaining_Quantity, Packlist 
      FROM [Production].[dbo].[Job] AS j  
      LEFT JOIN(SELECT Job, Act_Price AS NRE_Charges 
      FROM [Production].[dbo].[Additional_Charge]) AS ac  
      ON j.Job = ac.Job  
      LEFT JOIN 
      (SELECT *  FROM [Production].[dbo].[Delivery]) AS d ON j.Job = d.Job 
      WHERE j.Job = :jobID;
      `,
      {
        replacements: {
          jobID,
        },
        type: glDB.QueryTypes.SELECT,
      }
    );

    console.log(po);

    res.status(200).json({
      status: 'success',
      results: po.length,
      po: po,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

module.exports = router;
