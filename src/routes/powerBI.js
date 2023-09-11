import express, { Request, Response } from "express";
import fs from "fs";
const router = express.Router();

const { glDB } = require("../config/database");
import embedToken from "../services/embedConfigService";
const utils = require("../utils");

router.get("/powerBI/getEmbedToken", async (req, res) => {
  try {
    // Validate whether all the required configurations are provided in config.json
    const configCheckResult = utils.validateConfig();
    if (configCheckResult) {
      return res.status(400).send({
        error: configCheckResult,
      });
    }

    // console.log(configCheckResult)
    // Get the details like Embed URL, Access token and Expiry
    let result = await embedToken.getEmbedInfo();

    // result.status specified the statusCode that will be sent along with the result object
    res.status(result.status).send(result);

    // res.status(200).json({
    //   status: 'success',
    //   results: tracking.length,
    //   tracking: tracking,
    // });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

module.exports = router;
