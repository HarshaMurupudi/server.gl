import Sequelize from "sequelize";
const { glNotesDB: db } = require("../../config/database");

const PrintNotes = db.define(
  "Pending_Jobs_Notes",
  {
    Pending_Job_Note_ID: {
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
    Notes: {
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

    tableName: "Pending_Jobs_Notes",
  }
);

module.exports = PrintNotes;
