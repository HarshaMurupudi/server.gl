import Sequelize from "sequelize";

const { glDB: db } = require("../config/database");

const Guide = db.define(
  "Job",
  {
    Job: {
      primaryKey: true,
      type: Sequelize.STRING,
    },
    Part_Number: {
      type: Sequelize.STRING,
    },
    Order_Quantity: {
      type: Sequelize.INTEGER,
    },
    Order_Date: {
      type: Sequelize.DATE,
    },
    Quote: {
      type: Sequelize.STRING,
    },
    Unit_Price: {
      type: Sequelize.INTEGER,
    },
    Total_Price: {
      type: Sequelize.INTEGER,
    },
    Est_Labor: {
      type: Sequelize.INTEGER,
    },
    Est_Material: {
      type: Sequelize.INTEGER,
    },
    Est_Service: {
      type: Sequelize.INTEGER,
    },
    Est_Labor_Burden: {
      type: Sequelize.INTEGER,
    },
    Est_Machine_Burden: {
      type: Sequelize.INTEGER,
    },
    Est_GA_Burden: {
      type: Sequelize.INTEGER,
    },
    Act_Labor: {
      type: Sequelize.INTEGER,
    },
    Act_Material: {
      type: Sequelize.INTEGER,
    },
    Act_Service: {
      type: Sequelize.INTEGER,
    },
    Act_Labor_Burden: {
      type: Sequelize.INTEGER,
    },
    Act_Machine_Burden: {
      type: Sequelize.INTEGER,
    },
    Act_GA_Burden: {
      type: Sequelize.INTEGER,
    },
    Act_Revenue: {
      type: Sequelize.INTEGER,
    }
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

module.exports = Guide;
