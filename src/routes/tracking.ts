import express, { Request, Response } from "express";
import fs from "fs";
const router = express.Router();
var querystring = require("querystring");

const { glDB } = require("../config/database");

router.get("/tracking", async (req: Request, res: Response) => {

  const paramneter = Object.keys(req.query)[0] === 'Job' ? 'pd.Job': Object.keys(req.query)[0]
  try {
    const sqlQuery =
      `
      SELECT pd.Job, pd.Packlist, Tracking_Nbr, Customer, d.Shipped_Date, d.Shipped_Quantity, ph.Ship_Via, ph.Ship_To, d.Invoice_Line, j.Rev
      FROM [Production].[dbo].Packlist_Detail AS pd
      LEFT JOIN
      (SELECT * from [Production].[dbo].[Job]) as j
      on pd.Job = j.Job
      LEFT JOIN
      (SELECT * from [Production].[dbo].Delivery) as d
      on pd.Packlist = d.Packlist
      LEFT JOIN
      (SELECT * from [Production].[dbo].Packlist_Header) as ph
      on pd.Packlist = ph.Packlist
      WHERE ` + paramneter;

    const tracking = await glDB.query(
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
      results: tracking.length,
      tracking: tracking,
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
