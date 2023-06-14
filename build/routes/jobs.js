"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const Job = require('../models/Job');
const router = express_1.default.Router();
const { glDB } = require('../config/database');
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const jobs = await Job.findAll({ limit: 50 });
        const jobs = glDB.query(`
          SELECT DISTINCT
    (t1.Job), t3.[Notes], Part_Number, Customer, Status, Description, Order_Quantity, Completed_Quantity, CAST(Promised_Date as date) AS Promised_Date, CAST(Requested_Date as date) AS Requested_Date, CAST((Promised_Date - Lead_Days) AS date) AS Ship_By_Date
    FROM [Production].[dbo].[Job] AS t1
    INNER JOIN (SELECT Job, Promised_Date, Requested_Date
    FROM [Production].[dbo].[Delivery] WHERE Packlist IS NULL AND Remaining_Quantity > 0) AS t2 ON t1.Job = t2.Job
    LEFT JOIN(SELECT * FROM [General_Label].[dbo].[Notes_Final]) AS t3 ON t1.Job = t3.Job
    WHERE Status IN ('Active', 'Complete', 'Hold', 'Pending')
    ORDER BY Ship_By_Date ASC;
          `);
        res.status(200).json({
            status: 'success',
            results: jobs[0].length,
            jobs: jobs[0],
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'Error',
            message: error.message,
        });
    }
}));
router.get('/part-number/:partID', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { partID } = req.params;
        var isWin = process.platform === 'win32';
        const filePath = isWin
            ? `\\\\gl-fs01\\GLIParts\\${partID}\\Current\\Prints\\Image\\`
            : `//gl-fs01/GLIParts/${partID}/Current/Prints/Image/`;
        const fileName = fs_1.default.readdirSync(filePath)[0];
        if (fileName) {
            res.download(filePath + fileName);
        }
        else {
            res.status(400).json({
                status: 'Error',
                message: 'No file',
            });
        }
    }
    catch (error) {
        res.status(400).json({
            status: 'Error',
            message: error.message,
        });
    }
}));
module.exports = router;
