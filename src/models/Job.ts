import Sequelize from "sequelize";

const { glDB: db } = require("../config/database");
const Delivery = require("./Delivery");

const Job = db.define(
  "Job",
  {
    Job: {
      primaryKey: true,
      type: Sequelize.STRING,
    },
    Part_Number: {
      type: Sequelize.STRING,
    },
    // Sales_Rep: {
    //   type: Sequelize.STRING,
    // },
    Customer: {
      type: Sequelize.BOOLEAN,
    },
    Customer_PO: {
      type: Sequelize.STRING,
    },
    Status: {
      type: Sequelize.STRING,
    },
    Description: {
      type: Sequelize.STRING,
    },
    Order_Quantity: {
      type: Sequelize.INTEGER,
    },
    Completed_Quantity: {
      type: Sequelize.INTEGER,
    },
    Released_Date: {
      type: Sequelize.DATE,
    },
    Order_Date: {
      type: Sequelize.DATE,
    },
    Type: {
      type: Sequelize.STRING,
    },
    Sales_Code: {
      type: Sequelize.STRING,
    },
    Rev: {
      type: Sequelize.STRING,
    },
    Sales_Rep: {
      type: Sequelize.STRING,
    },
    Quote: {
      type: Sequelize.STRING,
    },
    Ship_Via: {
      type: Sequelize.STRING,
    },
    Make_Quantity: {
      type: Sequelize.INTEGER,
    },
    Shipped_Quantity: {
      type: Sequelize.INTEGER,
    },
    Unit_Price: {
      type: Sequelize.INTEGER,
    },
    Lead_Days: {
      type: Sequelize.INTEGER,
    },
  },
  {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,

    // If don't want createdAt
    createdAt: false,

    // If don't want updatedAt
    updatedAt: false,

    tableName: "Job",
  }
);

Job.hasMany(Delivery, {
  foreignKey: "Job",
});

module.exports = Job;
