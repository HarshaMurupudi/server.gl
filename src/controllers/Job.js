import fs from 'fs';

const { glDB } = require('../config/database');

class JobController {
  async getLatestJobs() {
    var isWin = process.platform === 'win32';
    const TODAY = new Date().setHours(0, 0, 0, 0);
    var sdtzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    var sd = new Date(TODAY);
    var sdlocalISOTime = new Date(sd - sdtzoffset).toISOString().slice(0, -1);
    const sdfDate = sdlocalISOTime.split('T')[0];

    const jobs = await glDB.query(
      `SELECT * FROM [Production].[dbo].[Job]
          WHERE Order_Date >= :orderDate;
          `,
      {
        replacements: {
          orderDate: sdfDate,
        },
      }
    );

    const parentJobs = jobs[0].filter((job) => job.Job == job.Top_Lvl_Job);

    //all jobs that don't have folder

    const filteredJobs = [];

    // for (let cJob of [...jobs[0], ...[{ Job: "Test11" }]]) {
    for (let cJob of parentJobs) {
      const { Job } = cJob;

      if (cJob.Status == 'Template') {
        // get and set all sub jobs
        const subJobs = await glDB.query(
          `
          SELECT [Component_Job]
          FROM [Production].[dbo].[Bill_Of_Jobs]
          WHERE Parent_Job = :jobID; 
        `,
          {
            replacements: {
              jobID: job.Job,
            },
            type: glDB.QueryTypes.SELECT,
          }
        );

        const subJobList = subJobs.map((job) => job.Component_Job);

        for (const subJob of subJobList) {
          const filePath = isWin
            ? `\\\\gl-fs01\\GLIOrders\\${subJob}\\`
            : `/Volumes/GLIOrders/${subJob}/`;

          if (!fs.existsSync(filePath)) {
            filteredJobs.push(subJob);
          }
        }
      }

      const filePath = isWin
        ? `\\\\gl-fs01\\GLIOrders\\${Job}\\`
        : `/Volumes/GLIOrders/${Job}/`;

      if (!fs.existsSync(filePath)) {
        filteredJobs.push(cJob);
      }
    }

    return filteredJobs;
  }
}

module.exports = new JobController();
