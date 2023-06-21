import express, { Request, Response } from 'express';
import fs from 'fs';
const Operation = require('../models/Operation');
const router = express.Router();
const { glDB } = require('../config/database');

router.get('/operations/:jobID', async (req: Request, res: Response) => {
  try {
    const { jobID } = req.params;

    const operations = await Operation.findAll({
      where: { Job: jobID },
      order: [['Sequence', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      results: operations.length,
      operations,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'Error',
      message: error.message,
    });
  }
});

module.exports = router;
