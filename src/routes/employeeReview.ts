import express, { Request, Response } from "express";
const router = express.Router();

const { glDB } = require("../config/database");

router.get("/reports", async (req, res) => {
    try {
        const reports = await glDB.query(
            `
            SELECT *
            FROM [General_Label].[dbo].[Employee_Review]
            `,
        );
        if (reports[0].length > 0) {
            res.status(200).json({
                status: "success",
                results: reports[0].length,
                reports: reports[0],
            });
        } else {
            res.status(200).json({
                status: "success",
                reports: [],
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