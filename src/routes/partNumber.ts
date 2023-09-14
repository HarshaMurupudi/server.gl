import express, { Request, Response } from "express";
import fs from "fs";

const router = express.Router();

router.get("/part-number/:jobID/po/info", async (req, res) => {
  try {
    const { jobID: partValue } = req.params;
    const jobID = partValue.split("_")[0];
    var isWin = process.platform === "win32";

    const filePath = isWin
      ? `\\\\gl-fs01\\GLIOrders\\${jobID}\\Contracts\\`
      : `//gl-fs01/GLIOrders/${jobID}/Contracts/`;

    const allFiles = fs.readdirSync(filePath);
    const pdfs = allFiles.filter(
      (name) =>
        name.includes(".pdf") || name.includes(".doc") || name.includes(".PDF")
    );

    if (pdfs.length > 0) {
      res.status(200).json({
        status: "success",
        count: pdfs.length,
      });
    } else {
      res.status(400).json({
        status: "Error",
        message: "No file",
      });
    }
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

router.get("/part-number/:jobID/po/:count", async (req, res) => {
  try {
    const { jobID: partValue, count } = req.params;
    const jobID = partValue.split("_")[0];
    var isWin = process.platform === "win32";

    const filePath = isWin
      ? `\\\\gl-fs01\\GLIOrders\\${jobID}\\Contracts\\`
      : `//gl-fs01/GLIOrders/${jobID}/Contracts/`;

    const allFiles = fs.readdirSync(filePath);
    console.log(allFiles);
    const pdf = allFiles.filter(
      (name) =>
        name.includes(".pdf") || name.includes(".doc") || name.includes(".PDF")
    );

    const fileName = pdf[parseInt(count) - 1];

    if (fileName) {
      res.download(filePath + fileName);
    } else {
      res.status(400).json({
        status: "Error",
        message: "No file",
      });
    }
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

module.exports = router;
