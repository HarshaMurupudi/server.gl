import express, { Request, Response } from "express";
const Sequelize = require("sequelize");

const router = express.Router();
const { glDB } = require("../config/database");
const Employee = require("../models/notes/AttendanceNotes");

router.get("/attendance", async (req, res) => {
  try {
    const attendance = await glDB.query(
      ` 
      SELECT 
      t1.Employee, 
      t1.Status, 
      t1.First_Name, 
      t1.Last_Name, 
      t2.Login, 
      t2.Logout,
      t3.Attendance_Note,
      t3.Attendance_Note_ID
      FROM [Production].[dbo].[Employee] AS t1
      INNER JOIN
      (SELECT Employee, Login, Logout
      FROM [Production].[dbo].[Attendance]) AS t2
      ON t1.Employee = t2.Employee
      LEFT JOIN
      (SELECT *
      FROM [General_Label].[dbo].[Attendance_Notes]) AS t3
      ON t1.Employee = t3.Employee AND t2.Login = t3.Login
      WHERE t2.Login > getdate()
      AND t2.Login < getdate()
      `
    );
    if (attendance[0].length > 0 ) {
      res.status(200).json({
          status: "success",
          results: attendance[0].length,
          attendance: attendance[0],
      });
    } else {
      res.status(200).json({
          status:"success",
          attendance: [],
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

// Attendance & Notes
// SELECT * FROM [General_Label].[dbo].[Attendance_Notes] AS t1
// LEFT JOIN
// (SELECT Employee, Login, Logout
// FROM [Production].[dbo].[Attendance]) AS t2
// ON t1.Employee = t2.Employee
// LEFT JOIN
// (SELECT Employee, Status
// FROM [Production].[dbo].[Employee]) AS t3
// ON t2.Employee = t3.Employee
// WHERE t2.Login > DATEADD(month, -2, getdate())
// AND t3.Status = 'Active'
// AND t1.Login = t2.Login
//       `

// LEFT JOIN
//       (SELECT *
//       FROM [General_Label].[dbo].[Attendance_Notes]) AS t3
//       ON t2.Employee = t3.Employee
//       WHERE t2.Login > DATEADD(month, -2, getdate())
//       AND t1.Status = 'Active'
//       AND t2.Login = t3.Login