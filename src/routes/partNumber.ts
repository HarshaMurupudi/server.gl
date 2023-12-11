import express, { Request, Response } from "express";
import fs from "fs";

const { glDB } = require("../config/database");

const router = express.Router();

router.get(
  "/part-numbers/:partNumber/art/approval/pdfs/info",
  async (req, res) => {
    try {
      const { partNumber } = req.params;
      var isWin = process.platform === "win32";

      const filePath = isWin
        ? `\\\\gl-fs01\\GLIParts\\${partNumber}\\Current\\Art\\Approval\\`
        : `//gl-fs01/GLIParts/${partNumber}/Current/Art/Approval/`;

      const allFiles = fs.readdirSync(filePath);
      const pdfs = allFiles.filter(
        (name) =>
          name.includes(".pdf") ||
          name.includes(".doc") ||
          name.includes(".PDF")
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
      console.log(error.code);
      res.status(400).json({
        status: "Error",
        message: error.message,
        code: error.code,
      });
    }
  }
);

router.get(
  "/part-numbers/:partNumber/art/approval/pdfs/:count",
  async (req, res) => {
    try {
      const { partNumber, count } = req.params;
      var isWin = process.platform === "win32";

      const filePath = isWin
        ? `\\\\gl-fs01\\GLIParts\\${partNumber}\\Current\\Art\\Approval\\`
        : `//gl-fs01/GLIParts/${partNumber}/Current/Art/Approval/`;

      const allFiles = fs.readdirSync(filePath);
      const pdf = allFiles.filter(
        (name) =>
          name.includes(".pdf") ||
          name.includes(".doc") ||
          name.includes(".PDF")
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
      // console.log(error);
      console.log(error.code);

      res.status(400).json({
        status: "Error",
        message: error.message,
        code: error.code,
      });
    }
  }
);

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
      code: error.code,
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
      code: error.code,
    });
  }
});

router.get("/inventory/part-number/:partID", async (req, res) => {
  try {
    const { partID } = req.params;
    const { jobID } = req.query;

    const parts = await glDB.query(
      `
      SELECT 
      LOC.Material, Location_ID, Lot, On_Hand_Qty, Deferred_Qty AS Allocated_Qty, MAT.Description, mr.Job FROM [Production].[dbo].[Material_Location] AS LOC
      INNER JOIN
      (SELECT Description, Material FROM [Production].[dbo].[Material]) AS MAT
      ON LOC.Material = MAT.Material
      LEFT JOIN
      (SELECT * FROM [Production].[dbo].[Material_Req] WHERE Deferred_Qty > 0) AS mr
      ON LOC.Material = mr.Material
      WHERE LOC.Material = :partID AND mr.Job = :jobID;
      `,
      {
        replacements: {
          partID,
          jobID,
        },
        type: glDB.QueryTypes.SELECT,
      }
    );

    const allocatedJobs = await glDB.query(
      `
      SELECT Job, Est_Qty, Deferred_Qty, Due_Date FROM [Production].[dbo].[Material_Req] 
		  WHERE Deferred_Qty > 0
      and Material = :partID;
      `,
      {
        replacements: {
          partID,
        },
        type: glDB.QueryTypes.SELECT,
      }
    );

    const total = parts.reduce((sum: any, item: { On_Hand_Qty: any }) => {
      sum = sum + item.On_Hand_Qty;
      return sum;
    }, 0);

    const allocatedTotal = allocatedJobs.reduce(
      (sum: any, item: { Deferred_Qty: any }) => {
        sum = sum + item.Deferred_Qty;
        return sum;
      },
      0
    );

    res.status(200).json({
      status: "success",
      result: parts.length,
      inventory: { parts, allocatedJobs, onHandSum: total, allocatedTotal },
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
      code: error.code,
    });
  }
});

router.get(
  "/part-numbers/:partNumber/cutting/zund/pdfs/info",
  async (req, res) => {
    try {
      const { partNumber } = req.params;
      const partNumb = partNumber.split("_")[0];
      var isWin = process.platform === "win32";

      const filePath = isWin
        ? `\\\\gl-fs01\\GLIParts\\${partNumb}\\Current\\Cutting\\Plotter\\`
        : `//gl-fs01/GLIParts/${partNumb}/Current/Cutting/Plotter/`;

      const allFiles = fs.readdirSync(filePath);
      const pdfs = allFiles.filter(
        (name) =>
          name.includes(".pdf") ||
          name.includes(".doc") ||
          name.includes(".PDF") ||
          name.includes(".eps") ||
          name.includes(".dxf") ||
          name.includes(".rcp")
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
      console.log(error.message);
      res.status(400).json({
        status: "Error",
        message: error.message,
        code: error.code,
      });
    }
  }
);

router.get(
  "/part-numbers/:partNumber/cutting/zund/pdfs/:count",
  async (req, res) => {
    const { partNumber, count } = req.params;
    const partNumb = partNumber.split("_")[0];
    var isWin = process.platform === "win32";

    const filePath = isWin
      ? `\\\\gl-fs01\\GLIParts\\${partNumb}\\Current\\Cutting\\Plotter\\`
      : `//gl-fs01/GLIParts/${partNumb}/Current/Cutting/Plotter/`;

    const allFiles = fs.readdirSync(filePath);
    const pdf = allFiles.filter(
      (name) =>
        name.includes(".pdf") ||
        name.includes(".doc") ||
        name.includes(".PDF") ||
        name.includes(".eps") ||
        name.includes(".dxf") ||
        name.includes(".rcp")
    );

    const fileName = pdf[parseInt(count) - 1];
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

    try {
      if (fileName) {
        await res.download(filePath + fileName);
      } else {
        res.status(400).json({
          status: "Error",
          message: "No file",
        });
      }
    } catch (error: any) {
      await res.download(filePath + fileName);

      console.log(error);
      res.status(400).json({
        status: "Error",
        message: error.message,
        code: error.code,
      });
    }
  }
);

module.exports = router;
