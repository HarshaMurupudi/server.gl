import express, { Request, Response } from "express";
import fs from "fs";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
// const Operation = require("../models/Operation");
const OperationTime = require("../models/OperationTime");
const Employee = require("../models/Employee");
const router = express.Router();
const { glDB } = require("../config/database");

router.get(
  "/operation-time/:operationId",
  async (req: Request, res: Response) => {
    try {
      const { operationId } = req.params;

      const operationTimes = await OperationTime.findAll({
        where: { Job_Operation: operationId },
        include: [
          {
            model: Employee,
            as: "employee",
            required: false,
            attributes: { exclude: ["SSN"] },
          },
        ],
      });

      res.status(200).json({
        status: "success",
        operationTimes,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "Error",
        message: error.message,
      });
    }
  }
);

module.exports = router;
