import express, { Request, Response } from "express";
const router = express.Router();

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const shopMSG = {
  to: 'spencererie01@gmail.com', // Change to your recipient
  from: 'spencererie01@gmail.com', // Change to your verified sender
  subject: 'New Shop Request',
  text: 'New Shop Request From: ',
  html: '<strong>New Shop Request From: </strong>',
}

const { glDB } = require("../config/database");

router.get("/requests/submit", async (req, res) => {
    try {
        const employees = await glDB.query(
            `
            SELECT First_Name, Last_Name, Status
            FROM [Production].[dbo].[Employee]
            WHERE STATUS = 'Active'
            ORDER BY First_Name ASC
            `,
        );
        const names_Array = []
        if (employees[0].length > 0 ) {

            for (const employee of employees[0]) {
                const firstName = employee.First_Name;
                const lastName = employee.Last_Name;

                if (firstName && lastName) {
                    const fullName = `${firstName} ${lastName}`;
                    names_Array.push(fullName);
                }
            }
        }
        const work_Centers = await glDB.query(
            `
            SELECT Work_Center
            FROM [Production].[dbo].[Work_Center]
            ORDER BY Work_Center ASC
            `,
        );
        const workCenters = []
        if (work_Centers[0].length > 0){
            for (const center of work_Centers[0]){
                workCenters.push(center.Work_Center)
            }
        }
        if (names_Array.length > 0 && workCenters.length > 0) {
            const requests = 
            {
                names: names_Array,
                workCenters: workCenters
            }
            res.status(200).json({
                status: "success",
                requests: requests,
            });
        } else {
            res.status(200).json({
                status:"success",
                employees: [],
                workCenters: [],            
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

router.get("/requests/entries", async (req, res) => {
    try {
        const shopArray = await glDB.query(
            `
            SELECT * 
            FROM [General_Label].[dbo].[Shop_Request]`,
        );
        const safetyArray = await glDB.query(
            `
            SELECT * 
            FROM [General_Label].[dbo].[Safety_Request]`,
        );
        const maintenanceArray = await glDB.query(
            `
            SELECT * 
            FROM [General_Label].[dbo].[Maintenance_Request]`,
        );
        const improvementArray = await glDB.query(
            `
            SELECT * 
            FROM [General_Label].[dbo].[Improvement_Request]`,
        );

        maintenanceArray[0].forEach((obj: any) => {
            if (obj !== null){
                obj.Part_Number = null;
                obj.Job_Number = null;
            }
          });

        safetyArray[0].forEach((obj: any) => {
        if (obj !== null){
            obj.Part_Number = null;
            obj.Job_Number = null;
        }
        });

        const entries = shopArray[0]
        .concat(maintenanceArray[0])
        .concat(improvementArray[0])
        .concat(safetyArray[0]);

        if (entries.length > 0) {
            res.status(200).json({
                status: "success",
                entries: entries,
            });
        } else {
            res.status(200).json({
                status:"success",
                entries: [],           
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

router.get("/requests/vacation", async (req, res) => {
    try {
        const vacations = await glDB.query(
            `
            SELECT *
            FROM [General_Label].[dbo].[Time_Off_Request]`
        )
        if (vacations.length > 0) {
            res.status(200).json({
                status: "success",
                vacations: vacations[0],
            });
        } else {
            res.status(200).json({
                status:"success",
                vacations: [],           
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

router.get("/requests/dieOrder", async (req, res) => {
    try {
        const die = await glDB.query(
            `
            SELECT *
            FROM [General_Label].[dbo].[Die_Order]`
        )
        if (die.length > 0) {
            res.status(200).json({
                status: "success",
                die: die[0],
            });
        } else {
            res.status(200).json({
                status:"success",
                die: [],           
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

router.get("/requests/eco", async (req, res) => {
    try {
        const eco = await glDB.query(
            `
            SELECT * 
            FROM [General_Label].[dbo].[Eco_Request]
            `,
        );
        if (eco.length > 0) {
            res.status(200).json({
                status: "success",
                eco: eco[0],
            });
        } else {
            res.status(200).json({
                status:"success",
                eco: [],           
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

router.get("/requests/dieOrder", async (req, res) => {
    try {
        const die = await glDB.query(
            `
            SELECT * 
            FROM [General_Label].[dbo].[Die_Order]
            `,
        );
        if (die.length > 0) {
            res.status(200).json({
                status: "success",
                die: die[0],
            });
        } else {
            res.status(200).json({
                status:"success",
                die: [],           
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