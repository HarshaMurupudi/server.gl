const cron = require('node-cron');

import {
  folderController,
  jobController,
  partController,
} from '../controllers';

module.exports = () => {
  cron.schedule('*/10 * * * * *', async function () {
    console.log('---------------------');
    console.log('Checking for new jobs every 10 seconds');

    // get all new jobs with no folders
    const jobs = await jobController.getLatestJobs();
    const parentJobs = jobs.filter((job) => job.Job == job.Top_Lvl_Job);

    for (const job of parentJobs) {
      // create job folders
      const { Job } = job;

      try {
        await folderController.createJob(Job);
      } catch (error) {
        console.log(error);
      }
    }

    // get all new parts with no folders
    const parts = await partController.getLatestParts();

    // create part folders
    for (const part of parts) {
      const { Part_Number } = part;
      try {
        await folderController.createPart(Part_Number);
      } catch (error) {
        console.log(error);
      }
    }
  });
};
