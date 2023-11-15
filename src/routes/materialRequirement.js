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
    for (let job of jobs) {
      const {
        Material: material,
        Type: type,
        Description: description,
        Est_Unit_Cost: estUnitCost,
        Lead_Days: leadDays,
        Material_Req: materialReq,
      } = job;

      const materailJobs = await glDB.query(
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
      materialsWithJobs[material].jobs = materailJobs || [];
      materialsWithJobs[material].type = type;
      materialsWithJobs[material].description = description;
      materialsWithJobs[material].estUnitCost = Number(estUnitCost).toFixed(2);
      materialsWithJobs[material].leadDays = leadDays;
      materialsWithJobs[material].onHandMaterial = onHandMaterialData;
      materialsWithJobs[material].onOrderMaterial = onOrderMaterialData;

      const total = onHandMaterialData.reduce((total, item) => {
        total += item.On_Hand_Qty;
        return total;
      }, 0);
      let tempCount = total;

      for (let materialJob of materailJobs) {
        const { Est_Qty } = materialJob;
        tempCount -= Est_Qty;
        let allocation = "";
        let risk = "None";

        if (tempCount >= 0) {
          allocation = `${Number(Est_Qty).toFixed(2)} from current inventory`;
        } else {
          if (Est_Qty + tempCount > 0) {
            risk = "Critical";
            allocation = `${(Number(Est_Qty + tempCount).toFixed(2))} from inventory & ${Math.abs(
              tempCount
            )} required`;
          } else {
            risk = "Critical";
            allocation = `${Number(Est_Qty).toFixed(2)} required`;
          }
        }
        materialJob.allocation = allocation;
        materialJob.risk = risk;
      }
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

router.get("/job/material/requirements/:jobID", async (req, res) => {
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

module.exports = router;
