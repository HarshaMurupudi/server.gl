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
        t1.Type,
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
          e.Type,
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

    // console.log(notes);

    const employees = await glDB.query(`
      SELECT 
        First_Name, 
        Last_Name, 
        Status,
        Type,
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

    interface Employee {
      First_Name: string;
      Last_Name: string;
      Type: string;
    }

    interface Attendance {
      Employee: string;
      Status: string;
      First_Name: string;
      Last_Name: string;
      Type: string;
      Login: string;
      Logout: string;
      Attendance_Note: string | null;
      Attendance_Note_ID: number | null;
      Note_Date: Date | null;
      Start_Time: Date | null;
      End_Time: Date | null;
      Post_Start_Grace: number;
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
    let loggedIn: any[] = [];

    for (const employee of employees[0]) {
      const matchingAttendance = findAttendance(employee.First_Name, employee.Last_Name);

      if (matchingAttendance.length > 0) {
        for (const updatedEmployee of matchingAttendance) {
          const matchingIndex = loggedIn.findIndex(
            emp => emp.First_Name === updatedEmployee.First_Name && emp.Last_Name === updatedEmployee.Last_Name
          );

          if (matchingIndex !== -1) {
            loggedIn[matchingIndex] = {
              ...loggedIn[matchingIndex],
              Attendance_Note: updatedEmployee.Attendance_Note,
              Attendance_Note_ID: updatedEmployee.Attendance_Note_ID,
              Note_Date: updatedEmployee.Note_Date
            };
            console.log(loggedIn[matchingIndex]);
          }
        }

        loggedIn = [...loggedIn, ...matchingAttendance];
      }
    }

    function timeDifference(date1: any, date2: any): any {
      const startDate = new Date(date1);
      if (!date2) {
        return null;
      }
      const endDate = new Date(date2);
    
      const startDateOffset = startDate.getTimezoneOffset();
      const endDateOffset = endDate.getTimezoneOffset();
      startDate.setMinutes(startDate.getMinutes() + startDateOffset);
      endDate.setMinutes(endDate.getMinutes() + endDateOffset);
    
      startDate.setFullYear(2000, 0, 1);
      endDate.setFullYear(2000, 0, 1);
    
      const diff = endDate.getTime() - startDate.getTime();
      const totalMinutes = diff / (1000 * 60);
      const decimalMinutes = totalMinutes.toFixed(2);
    
      return parseFloat(decimalMinutes);
    }

    async function processBreaks(entries: any) {
      const processedEntries = [];
      let currentLogout = null;
    
      for (const entry of entries) {
        if (entry.Logout) {
          if (!currentLogout) {
            currentLogout = entry;
          } else {
            const logoutStartTime = new Date(currentLogout.Logout);
            const logoutEndTime = new Date(entry.Login);
    
            // Check if the logout is within 8 hours of the previous login
            if (timeDifference(logoutStartTime, currentLogout.Login) <= 8 * 60) {
              // Check if there is another login within an hour
              const nextLogin = entries.find(
                (e: any) => e.Login && timeDifference(logoutEndTime, e.Login) <= 1
              );
    
              if (nextLogin) {
                // Calculate lunch break time
                const breakTime = timeDifference(logoutStartTime, nextLogin.Login);
                currentLogout.Break_Time = breakTime;
                processedEntries.push(currentLogout);
                currentLogout = null;
              } else {
                // No login within an hour, consider it as their final logout
                processedEntries.push(entry);
                currentLogout = null;
              }
            } else {
              // Logout after 8 hours, consider it as their final logout
              processedEntries.push(entry);
              currentLogout = null;
            }
          }
        } else {
          // Login entry, reset currentLogout
          currentLogout = null;
        }
      }
    
      return processedEntries;
    }

    const test = await processBreaks(loggedIn);

    console.log(test);

    const date = new Date(Date.now()).toISOString()


    if (loggedIn.length > 0) {
      res.status(200).json({
        status: "success",
        results: loggedIn.length,
        attendance: loggedIn,
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