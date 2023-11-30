import express, { Request, Response } from "express";
var path = require("path");
var exec = require("child_process").execFile;

const router = express.Router();

const { glDB } = require("../config/database");

const EXE_PATH = path.join(
  __dirname,
  "../services/MaintainOperationsClass/ConsoleWCMaintainanceApp.exe"
);

var opt = function (method: string, arg1: string, arg2: string) {
  exec(EXE_PATH, [method, arg1, arg2], function (err: any, data: any) {
    console.log(err);
    // console.log(data.toString());
  });
};

router.get("/jobBoss/:jobID/:status", async (req: Request, res: Response) => {
  try {
    const { jobID, status } = req.params;

    opt("SetJobStatus", jobID, status);

    res.status(200).json({
      status: "success",
      message: `Job status updated to ${status}`,
      //   results: po.length,
      //   po: po,
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

module.exports = router;
