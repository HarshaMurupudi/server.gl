import express from "express";
const { log } = require("console");
const { glDB } = require("../config/database");
const Employee = require("../models/notes/AttendanceNotes");

const router = express.Router();

router.get("/attendance", async (req, res) => {
  try {
    let attendance = await glDB.query(`
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
      FROM [Production].[dbo].[Attendance]
      WHERE CAST(Login AS Date) = CAST(GETDATE() AS Date)) AS t2
      ON t1.Employee = t2.Employee
      LEFT JOIN
      (SELECT *
      FROM [General_Label].[dbo].[Attendance_Notes]) AS t3
      ON t1.First_Name = t3.First_Name 
      AND t1.Last_Name = t3.Last_Name 
      AND t2.Login = t3.Login
    `);
    
    const notes = await glDB.query(`
      SELECT 
        First_Name, 
        Last_Name, 
        Status, 
        Login, 
        Attendance_Note, 
        Attendance_Note_ID
      FROM [General_Label].[dbo].[Attendance_Notes]
      WHERE STATUS = 'Active' 
      AND Login IS NULL
      AND CAST(Note_Date AS Date) = CAST(GETDATE() AS Date)
      ORDER BY First_Name ASC
    `);

    const employees = await glDB.query(`
      SELECT First_Name, Last_Name, Status
      FROM [Production].[dbo].[Employee]
      WHERE STATUS = 'Active'
      AND Last_Name != 'SALES'
      AND First_Name != 'Sales'
      ORDER BY First_Name ASC
    `);

    interface Employee {
      First_Name: string;
      Last_Name: string;
    }

    interface Attendance {
      Employee: string;
      Status: string;
      First_Name: string;
      Last_Name: string;
      Login: string;
      Logout: string;
      Attendance_Note: string | null;
      Attendance_Note_ID: number | null;
      Note_Date: Date | null;
    }

    function findAttendance(first: string, last: string): Attendance[] {
      const matchingEntries = attendance[0].filter((entry: any) =>
        entry.First_Name === first && entry.Last_Name === last
      );

      if (matchingEntries.length > 0) {
        return matchingEntries;
      } else {
        const matchingEntries = notes[0].filter((entry: any) =>
          entry.First_Name === first && entry.Last_Name === last
        );
        return matchingEntries;
      }
    }

    const loggedIn = employees[0].flatMap((employee: Employee) => {
      const matchingAttendance = findAttendance(employee.First_Name, employee.Last_Name);

      if (matchingAttendance.length > 0) {
        return matchingAttendance.map((entry: any) => ({
          Employee: entry.Employee,
          Status: entry.Status,
          First_Name: entry.First_Name,
          Last_Name: entry.Last_Name,
          Login: entry.Login,
          Logout: entry.Logout,
          Attendance_Note: entry.Attendance_Note,
          Attendance_Note_ID: entry.Attendance_Note_ID,
          Note_Date: entry.Note_Date,
        }));
      }
    });

    const notLoggedIn = employees[0].filter(
      (employee: any) => findAttendance(employee.First_Name, employee.Last_Name).length === 0
    );

    let allEmployees: any[] = [];

    loggedIn.forEach((employee: any) => {
      if (employee) {
        allEmployees.push(employee);
      }
    });

    const date = new Date(Date.now()).toISOString()

    notLoggedIn.forEach((employee: any) => {
      const nullObject = {
        Employee: employee.Employee,
        Status: employee.Status,
        First_Name: employee.First_Name,
        Last_Name: employee.Last_Name,
        Login: null,
        Logout: null,
        Attendance_Note: null,
        Attendance_Note_ID: null,
        Note_Date: date,
      };

      allEmployees.push(nullObject);
    });

    if (allEmployees.length > 0) {
      res.status(200).json({
        status: "success",
        results: allEmployees.length,
        attendance: allEmployees,
      });
    } else {
      res.status(200).json({
        status: "success",
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