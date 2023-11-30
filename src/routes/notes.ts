import express, { Request, Response } from "express";
const router = express.Router();

const Note = require("../models/Notes");

const EngineeringNotes = require("../models/EngineeringNotes");
const PrintNotes = require("../models/notes/PrintNotes");

const CircuitDepartmentNotes = require("../models/notes/CircuitDepartmentNotes");
const ConvertingNotes = require("../models/notes/ConvertingNotes");
const DigitalPrintingNotes = require("../models/notes/DigitalPrintingNotes");
const FMaterialNotes = require("../models/notes/FMaterialNotes");
const FinishingNotes = require("../models/notes/FinishingNotes");
const VendorNotes = require("../models/notes/VendorNotes");
const LamNotes = require("../models/notes/LamNotes");
const ObsoleteNotes = require("../models/notes/ObsoleteNotes");
const RoltNotes = require("../models/notes/RoltNotes");
const ShippingNotes = require("../models/notes/ShippingNotes");
const InspectionNotes = require("../models/notes/InspectionNotes");
const AttendanceNotes = require("../models/notes/AttendanceNotes");
const MeetingNotes = require("../models/notes/MeetingNotes");
const TrainingLogNotes = require("../models/notes/TrainingLogNotes");
const TrainingNotes = require("../models/notes/TrainingNotes");

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
      Plan_Notes = null,
      Assigned_To = null,
      DeliveryKey = null,
      Production_Status = null,
    } of jobs) {
      const obj = await Note.findOne({
        where: { DeliveryKey, Job },
      });

      if (obj) {
        obj.update({
          Production_Notes,
          Engineering_Notes,
          Plan_Notes,
          Assigned_To,
          Sales_Notes,
          Job_Plan,
          Production_Status: Production_Status
            ? parseInt(Production_Status)
            : Production_Status,
        });
      } else {
        Note.create({
          Job,
          DeliveryKey,
          Production_Notes,
          Engineering_Notes,
          Plan_Notes,
          Assigned_To,
          Sales_Notes,
          Job_Plan,
          Production_Status: Production_Status
            ? parseInt(Production_Status)
            : Production_Status,
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

router.patch("/meeting/notes", async (req, res) => {
  try {
    const {
      data: { meetings },
    } = req.body;
    for (const {
      Meeting_Note_ID,
      Description = null,
      Date = null,
      Meeting_Note = null,
    } of meetings) {
      const values = { Description, Date, Meeting_Note };
      const obj = await MeetingNotes.findOne({
        where: { Meeting_Note_ID },
      });
      if (obj) {
        obj.update({
          Description,
          Date,
          Meeting_Note,
        });
      } else {
        MeetingNotes.create({
          Meeting_Note_ID,
          values
        });
      }
    }
    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({
      status: "Error",
      message: `${error.message}`,
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

router.patch("/vendor/notes", async (req, res) => {
  try {
    const {
      data: { jobs },
    } = req.body;
    for (const {
      Job,
      DeliveryKey = null,
      Plan_Notes = null,
      Job_OperationKey = null,
      Priority = null,
    } of jobs) {
      const condition = { Job, DeliveryKey, Job_OperationKey };
      const values = { Plan_Notes, Priority };

      await upsert(VendorNotes, condition, values);
    }

    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({
      status: "Error",
      message: `${error.message}`,
    });
  }
});

router.patch("/attendance/notes", async (req, res) => {
  try {
    const {
      data: { attendance },
    } = req.body;
    for (const {
      Attendance_Note_ID,
      Employee = null,
      First_Name = null,
      Last_Name = null,
      Status = null,
      Login = null,
      Logout = null,
      Attendance_Note = null,
    } of attendance) {
      const obj = await AttendanceNotes.findOne({
        where: { Attendance_Note_ID },
      });
      if (obj) {
        obj.update({
          Employee,
          First_Name,
          Last_Name,
          Status,
          Login,
          Logout,
          Attendance_Note,
        });
      } else {
        AttendanceNotes.create({
          Attendance_Note_ID,
          Employee,
          First_Name,
          Last_Name,
          Status,
          Login,
          Logout,
          Attendance_Note,
        });
      }
    }
    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({
      status: "Error",
      message: `${error.message}`,
    });
  }
});

router.patch("/training/notes", async (req, res) => {
  try {
    const {
      data: { training },
    } = req.body;
    for (const {
      Training_ID,
      Date = null,
      Trainer = null,
      Training_Title = null,
      Training_Type = null,
      Training_Description = null,
    } of training ) {
      const obj = await TrainingNotes.findOne({
        where: { Training_ID },
      });
      if (obj) {
        obj.update({
          Date,
          Trainer,
          Training_Title,
          Training_Type,
          Training_Description
        });
      } else {
        TrainingNotes.create({
          Training_ID,
          Date,
          Trainer,
          Training_Title,
          Training_Type,
          Training_Description
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: training,
    });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({
      status: "Error",
      message: `${error.message}`,
    });
  }
});

router.patch("/training/log", async (req, res) => {
  try {
    const {
      data: { trainingLog },
    } = req.body;
    for (const {
      Training_ID,
      Date = null,
      Trainer = null,
      Employee_Name = null,
      Department = null,
      Training_Title = null,
      Needs_Repeat = null,
      Repeat_After = null,
      Note = null
    } of trainingLog) {
      const obj = await TrainingLogNotes.findOne({
        where: { Training_ID },
      });
      if (obj) {
        obj.update({
          Date,
          Trainer,
          Employee_Name,
          Department,
          Training_Title,
          Needs_Repeat,
          Repeat_After,
          Note
        });
      } else {
        TrainingLogNotes.create({
          Training_ID,
          Date,
          Trainer,
          Employee_Name,
          Department,
          Training_Title,
          Needs_Repeat,
          Repeat_After,
          Note
        });
      }
    }
    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log(error);

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

router.patch("/circuit/notes", async (req, res) => {
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

      await upsert(CircuitDepartmentNotes, condition, values);
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

router.patch("/converting/notes", async (req, res) => {
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

      await upsert(ConvertingNotes, condition, values);
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

router.patch("/digital/notes", async (req, res) => {
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

      await upsert(DigitalPrintingNotes, condition, values);
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

router.patch("/material/notes", async (req, res) => {
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

      await upsert(FMaterialNotes, condition, values);
    }

    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({
      status: "Error",
      message: `${error.message}`,
    });
  }
});

router.patch("/finishing/notes", async (req, res) => {
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

      await upsert(FinishingNotes, condition, values);
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

router.patch("/lam/notes", async (req, res) => {
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

      await upsert(LamNotes, condition, values);
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

router.patch("/obsolete/notes", async (req, res) => {
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

      await upsert(ObsoleteNotes, condition, values);
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

router.patch("/rolt/notes", async (req, res) => {
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

      await upsert(RoltNotes, condition, values);
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

router.patch("/shipping/notes", async (req, res) => {
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

      await upsert(ShippingNotes, condition, values);
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

router.patch("/inspection/notes", async (req, res) => {
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

      await upsert(InspectionNotes, condition, values);
    }

    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({
      status: "Error",
      message: `${error.message}`,
    });
  }
});

module.exports = router;
