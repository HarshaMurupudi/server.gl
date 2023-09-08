import Sequelize from "sequelize";
const { glDB: db } = require("../config/database");

const Operation = db.define(
  "Operation",
  {
    Job: {
      primaryKey: true,
      type: Sequelize.STRING,
    },
    Work_Center: {
      type: Sequelize.STRING,
    },
    WC_Vendor: {
      type: Sequelize.BOOLEAN,
    },
    Sequence: {
      type: Sequelize.INTEGER,
    },
    Job_Operation: {
      type: Sequelize.INTEGER,
    },
    Description: {
      type: Sequelize.STRING,
    },
    Status: {
      type: Sequelize.STRING,
    },
    Note_Text: {
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

    tableName: "Job_Operation",
  }
);

module.exports = Operation;
