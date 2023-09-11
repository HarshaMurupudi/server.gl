import express, { Request, Response } from "express";
const router = express.Router();

const Note = require("../models/Notes");
const EngineeringNotes = require("../models/EngineeringNotes");
const PrintNotes = require("../models/notes/PrintNotes");
const PendingJobsNotes = require("../models/notes/PendingJobsNotes");
import { upsert } from "../utils";

// const upsert = async (values, condition) => {
//     const obj = await Model
//       .findOne({
//         where: condition
//       })
//     if (obj) {
//       return obj.update(values);
//     }
//     return Model.create(values);
//   }

router.patch("/notes", async (req, res) => {
  try {
    const {
      data: { jobs },
    } = req.body;

    // find note with job and ship-by-date

    // for(const {Job, Ship_By_Date=null, Production_Notes=null, Sales_Notes=null, Job_Plan=null, Engineering_Notes=null} of jobs){
    //     await Note.upsert({
    //         Job,
    //         Ship_By_Date,
    //         Production_Notes,
    //         Sales_Notes,
    //         Job_Plan,
    //         Engineering_Notes
    //     });
    // }

    for (const {
      Job,
      Ship_By_Date = null,
      Production_Notes = null,
      Sales_Notes = null,
      Job_Plan = null,
      Engineering_Notes = null,
      DeliveryKey = null,
    } of jobs) {

      const obj = await Note.findOne({
        where: { DeliveryKey, Job },
      });

      if (obj) {
        obj.update({
          Production_Notes,
          Engineering_Notes,
          Sales_Notes,
          Job_Plan,
        });
      } else {
        Note.create({
          Job,
          DeliveryKey,
          Production_Notes,
          Engineering_Notes,
          Sales_Notes,
          Job_Plan,
        });
      }
    }

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
  }
});

router.patch("/engineering/notes", async (req, res) => {
  try {
    const {
      data: { jobs },
    } = req.body;

    for (const {
      Job,
      DeliveryKey = null,
      Job_OperationKey = null,
      Plan_Notes = null,
      Work_Center = null,
      Assigned_To = null,
      Priority = null,
    } of jobs) {
      const condition = { Job, DeliveryKey, Job_OperationKey, Work_Center };
      const values = { Plan_Notes, Priority, Assigned_To };

      //   await EngineeringNotes.upsert({
      //     Job,
      //     Sched_Start,
      //     Plan_Notes,
      //     Assigned_To,
      //     Priority,
      //   });
      await upsert(EngineeringNotes, condition, values);
    }

    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log(error.message);

    res.status(400).json({
      status: "Error",
      message: `${error.message} & Ship By Date must not be empty`,
    });
  }
});

router.patch("/print/notes", async (req, res) => {
  try {
    const {
      data: { jobs },
    } = req.body;

    for (const {
      Job,
      DeliveryKey = null,
      Plan_Notes = null,
      Job_OperationKey = null,
      Work_Center = null,
      Priority = null,
    } of jobs) {
      const condition = { Job, DeliveryKey, Job_OperationKey, Work_Center };
      const values = { Plan_Notes, Priority };

      await upsert(PrintNotes, condition, values);
    }

    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log(error.message);

    res.status(400).json({
      status: "Error",
      message: `${error.message}`,
    });
  }
});

router.patch("/jobs/pending/notes", async (req, res) => {
  try {
    const {
      data: { jobs },
    } = req.body;

    for (const {
      Job,
      DeliveryKey = null,
      Notes = null,
      Priority = null,
    } of jobs) {
      if (DeliveryKey) {
        const condition = { Job, DeliveryKey };
        const values = { Notes, Priority };

        await upsert(PendingJobsNotes, condition, values);
      }
    }

    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log(error.message);

    res.status(400).json({
      status: "Error",
      message: `${error.message}`,
    });
  }
});

module.exports = router;