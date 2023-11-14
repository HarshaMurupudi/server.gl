import Sequelize from "sequelize";
const { glNotesDB: db } = require("../config/database");

const DeliveryNotes = db.define(
  "Delivery_Notes",
  {
    Delivery_Note_ID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Job: {
      type: Sequelize.STRING,
    },
    Ship_By_Date: {
      type: Sequelize.STRING,
    },
    Production_Notes: {
      type: Sequelize.STRING,
    },
    Sales_Notes: {
      type: Sequelize.STRING,
    },
    Engineering_Notes: {
      type: Sequelize.STRING,
    },
    Job_Plan: {
      type: Sequelize.NUMBER,
    },
    DeliveryKey: {
      type: Sequelize.INTEGER,
    },
    Production_Status: {
      type: Sequelize.BOOLEAN
    }
  },
  {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,

    // If don't want createdAt
    createdAt: false,

    // If don't want updatedAt
    updatedAt: false,

    tableName: "Delivery_Notes",
  }
);

module.exports = DeliveryNotes;
