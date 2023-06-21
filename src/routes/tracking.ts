import express, { Request, Response } from 'express';
import fs from 'fs';
const router = express.Router();

const { glDB } = require('../config/database');

router.get('/tracking/:jobID', async (req: Request, res: Response) => {
  try {
    const { jobID } = req.params;

    const tracking = await glDB.query(
      `
      SELECT Job, Packlist, Tracking_Nbr 
      FROM [Production].[dbo].Packlist_Detail 
      WHERE Job = :jobID;
      `,
      {
        replacements: {
          jobID,
        },
        type: glDB.QueryTypes.SELECT,
      }
    );

    console.log(tracking);

    res.status(200).json({
      status: 'success',
      results: tracking.length,
      tracking: tracking,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

module.exports = router;
