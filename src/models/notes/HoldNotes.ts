import Sequelize from "sequelize";
const { glNotesDB: db } = require("../../config/database");

const HoldNotes = db.define(
  "Hold_Notes",
  {
    Hold_Note_ID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Job: {
      type: Sequelize.STRING,
    },
    DeliveryKey: {
      type: Sequelize.INTEGER,
    },
    Hold_Note: {
      type: Sequelize.STRING,
    },
    Priority: {
      type: Sequelize.STRING,
    },
  },
  {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,

    // If don't want createdAt
    createdAt: false,

    // If don't want updatedAt
    updatedAt: false,

    tableName: "Hold_Notes",
  }
);

module.exports = HoldNotes;
