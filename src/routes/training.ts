import express, { Request, Response } from "express";
const router = express.Router();

const { glDB } = require("../config/database");

router.get("/training", async (req, res) => {
    try {
        const training = await glDB.query(
            `
            SELECT *
            FROM [General_Label].[dbo].[Master_Training]
            `,
        );
        if (training[0].length > 0 ) {
            res.status(200).json({
                status: "success",
                results: training[0].length,
                training: training[0],
            });
        } else {
            res.status(200).json({
                status:"success",
                training: [],
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

router.get("/training/log", async (req, res) => {
    try {
        const trainingLog = await glDB.query(
            `
            SELECT *
            FROM [General_Label].[dbo].[Training_Log]
            `,
        );
        if (trainingLog[0].length > 0 ) {
            res.status(200).json({
                status: "success",
                results: trainingLog[0].length,
                trainingLog: trainingLog[0],
            });
        } else {
            res.status(200).json({
                status:"success",
                trainingLog: [],
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

router.get("/training/employees", async (req, res) => {
    try {
        const employees = await glDB.query(
            `
            SELECT First_Name, Last_Name, Status, Department
            FROM [Production].[dbo].[Employee]
            WHERE STATUS = 'Active'
            ORDER BY First_Name ASC
            `,
        );
        if (employees[0].length > 0 ) {
            const namesArray = []

            for (const employee of employees[0]) {
                const firstName = employee.First_Name;
                const lastName = employee.Last_Name;

                if (firstName && lastName) {
                    const fullName = `${firstName} ${lastName}`;
                    namesArray.push(fullName);
                }
            }
            res.status(200).json({
                status: "success",
                results: employees[0].length,
                names: namesArray,
                employees: employees[0],
            });
        } else {
            res.status(200).json({
                status:"success",
                employees: [],
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