import express, { Request, Response } from 'express';

const router = express.Router();

const { glDB } = require('../config/database');

// router.get('/po/:jobID', async (req: Request, res: Response) => {
//   try {
//     const { jobID } = req.params;




//     res.status(200).json({
//       status: 'success',
//     //   results: po.length,
//     //   po: po,
//     });
//   } catch (error: any) {
//     res.status(400).json({
//       status: 'Error',
//       message: error.message,
//     });
//   }
// });

module.exports = router;
