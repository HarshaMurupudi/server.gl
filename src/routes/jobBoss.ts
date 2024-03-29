import express, { Request, Response } from 'express';
var path = require('path');
var exec = require('child_process').execFile;

const router = express.Router();

const { glDB } = require('../config/database');
const auth = require('../middleware/auth');

const EXE_PATH = path.join(
  __dirname,
  '../services/MaintainOperationsClass/ConsoleWCMaintainanceApp.exe'
);

var opt = function (method: string, arg1: string, arg2: string, id: any) {
  exec(EXE_PATH, [method, arg1, arg2, id], function (err: any, data: any) {
    console.log(err, 'response', data);
    // console.log(data.toString());
  });
};

router.get(
  '/jobBoss/:jobID/:status/:employee',
  async (req: any, res: Response) => {
    try {
      const { jobID, status, employee } = req.params;

      // get and set parent job

      // get and set all sub jobs
      const subJobs = await glDB.query(
        `
          SELECT [Component_Job]
          FROM [Production].[dbo].[Bill_Of_Jobs]
          WHERE Parent_Job = :jobID; 
        `,
        {
          replacements: {
            jobID,
          },
          type: glDB.QueryTypes.SELECT,
        }
      );
      const subJobList = subJobs.map((job: any) => job.Component_Job);

      await opt('SetJobStatus', jobID, status, employee);
      // await opt("SetJobStatus", jobID, status, req.user.id);
      for (const subJob of subJobList) {
        // await opt("SetJobStatus", subJob, status, req.user.id);
        await opt('SetJobStatus', subJob, status, employee);

        // get and set all sub jobs
        const subChildJobs = await glDB.query(
          `
          SELECT [Component_Job]
          FROM [Production].[dbo].[Bill_Of_Jobs]
          WHERE Parent_Job = :jobID; 
        `,
          {
            replacements: {
              jobID: subJob,
            },
            type: glDB.QueryTypes.SELECT,
          }
        );

        const subChildJobList = subChildJobs.map(
          (job: any) => job.Component_Job
        );

        for (const subChildJob of subChildJobList) {
          // await opt("SetJobStatus", subChildJob, status, req.user.id);
          await opt('SetJobStatus', subChildJob, status, employee);
        }
      }

      res.status(200).json({
        status: 'success',
        message: `Job status updated to ${status}`,
        //   results: po.length,
        //   po: po,
      });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({
        status: 'Error',
        message: error.message,
      });
    }
  }
);

module.exports = router;
