import express from "express";

const { glDB } = require("../config/database");

const router = express.Router();

router.get("/material/requirements/:jobID", async (req, res) => {
  const { jobID } = req.params;

  try {
    const jobs = await glDB.query(
      `
        SELECT *
        FROM 
            [Production].[dbo].[Material_Req]
        WHERE 
            Job =:jobID
        `,
      {
        replacements: {
          jobID,
        },
        type: glDB.QueryTypes.SELECT,
      }
    );

    const materialsWithJobs = {};
    // for material get all jobs
    // push to object

    for (let job of jobs) {
      const {
        Material: material,
        Type: type,
        Description: description,
        Est_Unit_Cost: estUnitCost,
        Lead_Days: leadDays,
        Material_Req: materialReq,
      } = job;

      const jobs = await glDB.query(
        `
            SELECT *
            FROM 
                [Production].[dbo].[Material_Req] AS req
            LEFT JOIN 
				[Production].[dbo].[Job] AS j ON req.Job = j.Job
            WHERE 
                Material = :material AND (req.Status = 'O' OR req.Status = 'S');
          `,
        {
          replacements: {
            material,
          },
          type: glDB.QueryTypes.SELECT,
        }
      );

      const onHandMaterialData = await glDB.query(
        `
        SELECT 
        Location_ID, Lot, On_Hand_Qty FROM [Production].[dbo].[Material_Location] AS LOC
        WHERE LOC.Material = :material;
        `,
        {
          replacements: {
            material,
          },
          type: glDB.QueryTypes.SELECT,
        }
      );

      const onOrderMaterialData = await glDB.query(
        `
        SELECT 
        * FROM [Production].[dbo].[Source] AS src
	      LEFT JOIN
	      [Production].[dbo].[PO_Detail] AS detail ON src.PO_Detail = detail.PO_Detail
	      LEFT JOIN
	      [Production].[dbo].[PO_Header] AS header ON detail.PO = header.PO
        WHERE Material_Req = :materialReq;
        `,
        {
          replacements: {
            materialReq,
          },
          type: glDB.QueryTypes.SELECT,
        }
      );

      materialsWithJobs[material] = {};
      materialsWithJobs[material].jobs = jobs || [];
      materialsWithJobs[material].type = type;
      materialsWithJobs[material].description = description;
      materialsWithJobs[material].estUnitCost = estUnitCost;
      materialsWithJobs[material].leadDays = leadDays;
      materialsWithJobs[material].onHandMaterial = onHandMaterialData;
      materialsWithJobs[material].onOrderMaterial = onOrderMaterialData;
    }

    res.status(200).json({
      status: "success",
      results: Object.keys(materialsWithJobs).length,
      materials: materialsWithJobs,
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

// SELECT *
//   FROM [Production].[dbo].[Material_Req]
//  WHERE Job ='176269'

// SELECT *
// FROM
//     [Production].[dbo].[Material_Req]
// WHERE
//     Material = '3M 9653LE 2.25 X 360 YDS' AND (Status = 'O' OR Status = 'S');
