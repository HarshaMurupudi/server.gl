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
        t1.Shift,
        t2.Login,
        t2.Logout,
        t3.Attendance_Note,
        t3.Attendance_Note_ID,
        COALESCE(t4.Start_Time, '1900-01-01T00:00:00.000Z') AS Start_Time,
        COALESCE(t4.End_Time, '1900-01-01T00:00:00.000Z') AS End_Time,
        t4.Shift AS Shift_Day_Shift,
        t4.Sequence
      FROM [Production].[dbo].[Employee] AS t1
      LEFT JOIN [Production].[dbo].[Attendance] AS t2
        ON t1.Employee = t2.Employee
        AND CAST(t2.Login AS Date) = CAST(GETDATE() AS Date)
      LEFT JOIN [General_Label].[dbo].[Attendance_Notes] AS t3
        ON t1.First_Name = t3.First_Name
        AND t1.Last_Name = t3.Last_Name
        AND t2.Login = t3.Login
      LEFT JOIN [Production].[dbo].[Shift_Day] AS t4
        ON t1.Shift = t4.Shift
      WHERE t4.Sequence = (DATEPART(dw, GETDATE()) - 1);
    `);
    
    const notes = await glDB.query(`
      SELECT
        t1.First_Name,
        t1.Last_Name,
        t1.Status,
        t1.Login,
        t1.Logout,
        t1.Attendance_Note,
        t1.Attendance_Note_ID,
        t1.Note_Date,
        t2.Shift,
        COALESCE(t2.Start_Time, '1900-01-01T00:00:00.000Z') AS Start_Time,
        COALESCE(t2.End_Time, '1900-01-01T00:00:00.000Z') AS End_Time,
        t2.PostStart_Grace,
        t2.Sequence
      FROM
        [General_Label].[dbo].[Attendance_Notes] AS t1
      LEFT JOIN
        (SELECT
          e.First_Name,
          e.Last_Name,
          t2.Shift,
          t2.Start_Time,
          t2.End_Time,
          t2.PostStart_Grace,
          t2.Sequence
        FROM
          [Production].[dbo].[Employee] AS e
        LEFT JOIN
          [Production].[dbo].[Shift_Day] AS t2 ON e.Shift = t2.Shift
        ) AS t2 ON t1.First_Name = t2.First_Name AND t1.Last_Name = t2.Last_Name
      WHERE
        t1.Status = 'Active'
        AND t1.Login IS NULL
        AND CAST(t1.Note_Date AS Date) = CAST(GETDATE() AS Date)
        AND t2.Sequence = (DATEPART(dw,GETDATE()) - 1)
      ORDER BY
        t1.First_Name ASC;
    `);

    const employees = await glDB.query(`
      SELECT 
        First_Name, 
        Last_Name, 
        Status,
        t1.Shift,
        t2.Shift,
        COALESCE(t2.Start_Time, '1900-01-01T00:00:00.000Z') AS Start_Time,
        COALESCE(t2.End_Time, '1900-01-01T00:00:00.000Z') AS End_Time,
        t2.PostStart_Grace
      FROM [Production].[dbo].[Employee] AS t1
      LEFT JOIN
        (SELECT *
        FROM [Production].[dbo].[Shift_Day]) AS t2
      ON t1.Shift = t2.Shift
      WHERE STATUS = 'Active'
        AND Last_Name != 'SALES'
        AND First_Name != 'Sales'
        AND Sequence = (DATEPART(dw, GETDATE()) - 1)
      ORDER BY First_Name ASC;
    `);

    console.log(notes);

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
      Start_Time: Date | null;
      End_Time: Date | null;
      Post_Start_Grace: number;
    }

    console.log(attendance);

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
          Start_Time: entry.Start_Time,
          End_Time: entry.End_Time,
          Post_Start_Grace: entry.PostStart_Grace
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
        Start_Time: employee.Start_Time,
        End_Time: employee.End_Time,
        Post_Start_Grace: employee.PostStart_Grace
      };

      allEmployees.push(nullObject);
    });

    // console.log(allEmployees);

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