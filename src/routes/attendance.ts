import express, { Request, Response } from "express";
import fs from "fs";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const Operation = require("../models/Operation");
const router = express.Router();
const { glDB } = require("../config/database");
const Employee = require("../models/Attendance");

router.get("/attendance", async (req, res) => {
  try {
    const employees = await glDB.query(
      ` 
        SELECT 
          Employee,
          First_Name,
          Last_Name,
          Status,
          Class
        FROM [Production][dbo][Employee] as t1
         INNER JOIN
         (SELECT * FROM [Production][dbo][Attendance]) AS t2
         ON t1.Employee = t2.Employee
        WHERE Status IS 'Active'

      `
    );

    res.status(200).json({
      status: "success",
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
