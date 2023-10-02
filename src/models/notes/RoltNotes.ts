import Sequelize from "sequelize";
const { glNotesDB: db } = require("../../config/database");

const PrintNotes = db.define(
  "Rolt_Notes",
  {
    Rolt_Note_ID: {
      primaryKey: true,
      type: Sequelize.STRING,
      autoIncrement: true,
    },
    Job: {
      type: Sequelize.STRING,
    },
    DeliveryKey: {
      type: Sequelize.INTEGER,
    },
    Job_OperationKey: {
      type: Sequelize.INTEGER,
    },
    Work_Center: {
      type: Sequelize.STRING,
    },
    Plan_Notes: {
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

    tableName: "Rolt_Notes",
  }
);

module.exports = PrintNotes;
