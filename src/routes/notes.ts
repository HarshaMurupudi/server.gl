import express, { Request, Response } from 'express';
const router = express.Router();

const Note = require('../models/Notes');

router.patch('/notes', async (req, res) => {
    try {
    const {
        data: {
            jobs
        }
    } = req.body;

    for(const {Job, Ship_By_Date=null, Production_Notes=null, Sales_Notes=null, Job_Plan=null, Engineering_Notes=null} of jobs){
        await Note.upsert({
            Job,
            Ship_By_Date,
            Production_Notes,
            Sales_Notes, 
            Job_Plan,
            Engineering_Notes
        });
    }
  
    res.status(200).json({
        status: 'success'
    });
    } catch (error) {
      console.log(error);
    }
  });

  module.exports = router;