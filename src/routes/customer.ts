import express, { Request, Response } from "express";
import { Op } from "sequelize";

const CustomerModel = require("../models/Customer");

const router = express.Router();

interface Customer {
  Customer: any;
}

router.get("/customers/search", async (req: Request, res: Response) => {
  try {
    let { Customer } = req.query;
    let query = {
      where: { Customer: { [Op.like]: Customer + "%" } },
      attributes: ["Customer"],
      limit: 6,
    };

    const customers = await CustomerModel.findAll(query);
    const flatCustomers = customers.map(({ Customer }: Customer) => Customer);

    res.status(200).json({
      status: "success",
      results: flatCustomers.length,
      customers: flatCustomers,
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
});

module.exports = router;
