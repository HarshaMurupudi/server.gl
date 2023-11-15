import express, { Request, Response } from "express";
const router = express.Router();

const { glDB } = require("../config/database");

router.get("/meeting", async (req, res) => {
    try {
        const meeting = await glDB.query(
            `
            SELECT *
            FROM [General_Label].[dbo].[Meeting_Notes]
            `,
        );
        if (meeting[0].length > 0 ) {
            res.status(200).json({
                status: "success",
                results: meeting[0].length,
                meeting: meeting[0],
            });
        } else {
            res.status(200).json({
                status:"success",
                meeting: [],
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