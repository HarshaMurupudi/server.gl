import express from "express";
const { log } = require("console");
const { glDB } = require("../config/database");
const Employee = require("../models/notes/AttendanceNotes");

const router = express.Router();

router.get("/attendance/events", async (req, res) => {
  try {
    let events = await glDB.query(`
        SELECT 
            t1.Employee, 
            t1.Status, 
            t1.First_Name, 
            t1.Last_Name, 
            t2.Employee,
            t2.Work_Date,
            t2.Attendance_Type
        FROM [Production].[dbo].[Employee] AS t1
        INNER JOIN
        (SELECT Employee, Work_Date, Attendance_Type
        FROM [Production].[dbo].[Attendance]) AS t2
        ON t1.Employee = t2.Employee
        WHERE 
        t2.Attendance_Type > 1
        AND t2.Work_Date > dateadd(WEEK, -2, GETDATE())
        AND t2.Work_Date < dateadd(MONTH, 6, GETDATE())
    `);
    
    // const holidays = await glDB.query(`
    //       SELECT
    // `);

    interface Event {
        Employee: string;
        Status: string;
        First_Name: string;
        Last_Name: string;
        Work_Date: string;
        Attendance_Type: number;
      }
      

    const formatData = (data: { status: string; results: number; events: Event[] }) => {
        const formattedEvents = [];
      
        // group events by employee
        const groupedEvents: { [key: string]: Event[] } = events[0].reduce((acc: any, event: any) => {
          const key = `${event.Employee}-${event.Attendance_Type}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(event);
          return acc;
        }, {});
      
        // handle grouped events
        for (const key in groupedEvents) {
          const events = groupedEvents[key].sort((a, b) => new Date(a.Work_Date).getTime() - new Date(b.Work_Date).getTime());
      
          let currentStartDate = null;
          let currentEndDate = null;
      
          for (const event of events) {
            const eventDate = new Date(event.Work_Date).getTime();
      
            // check if the current event is consecutive to the last one
            if (currentEndDate && eventDate - currentEndDate === 24 * 60 * 60 * 1000) {
            currentEndDate = eventDate;
            } else {
            if (currentStartDate && currentEndDate) {
                const fullName = `${event.First_Name} ${event.Last_Name}`;
                let title = '';
                if (event.Attendance_Type === 2) {
                    title = `${fullName} - Vacation`;
                } else {
                    title = `${fullName} - Sick`;
                }
                const formattedEvent = {
                title,
                allDay: true,
                start: new Date(currentStartDate),
                end: new Date(currentEndDate),
                };
    
                formattedEvents.push(formattedEvent);
            }
    
            // start a new consecutive vacation period
            currentStartDate = eventDate;
            currentEndDate = eventDate;
            }
          }
      
          // add the last consecutive event for the employee, if any
          if (currentStartDate && currentEndDate) {
            const fullName = `${events[0].First_Name} ${events[0].Last_Name}`;
            const title = `${fullName} - Vacation`;
      
            const formattedEvent = {
              title,
              allDay: true,
              start: new Date(currentStartDate),
              end: new Date(currentEndDate),
            };
      
            formattedEvents.push(formattedEvent);
          }
        }
      
        return formattedEvents;
      };
      

    events = formatData(events);

    if (events.length > 0) {
      res.status(200).json({
        status: "success",
        results: events.length,
        events: events,
      });
    } else {
      res.status(200).json({
        status: "success",
        events: [],
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