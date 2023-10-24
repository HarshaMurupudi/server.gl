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
      const { Material: material } = job;

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

      if (jobs.length > 0) {
        materialsWithJobs[material] = jobs;
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

module.exports = router;

// SELECT *
//   FROM [Production].[dbo].[Material_Req]
//  WHERE Job ='176269'

// SELECT *
// FROM
//     [Production].[dbo].[Material_Req]
// WHERE
//     Material = '3M 9653LE 2.25 X 360 YDS' AND (Status = 'O' OR Status = 'S');
