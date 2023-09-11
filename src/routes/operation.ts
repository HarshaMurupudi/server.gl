import express, { Request, Response } from "express";
import fs from "fs";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Operation = require("../models/Operation");
const router = express.Router();
const { glDB } = require("../config/database");

router.get("/operations/:jobID", async (req: Request, res: Response) => {
  try {
    const { jobID } = req.params;

    const operations = await Operation.findAll({
      where: { Job: { [Op.like]: "%" + jobID + "%" } },
      order: [["Sequence", "ASC"]],
    });

    // console.log(operations);
    const groupedOperations = operations.reduce((obj: any, item: any) => {
      if (obj[item.Job]) {
        obj[item.Job].push(item);
      } else {
        obj[item.Job] = [item];
      }

      return obj;
    }, {});

    res.status(200).json({
      status: "success",
      operations: groupedOperations,
      // operations: operations,
    });
  } catch (error: any) {
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

module.exports = router;
