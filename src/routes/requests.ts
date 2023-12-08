import express, { Request, Response } from "express";
const router = express.Router();

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

module.exports = router;