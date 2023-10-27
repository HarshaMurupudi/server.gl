import Sequelize from "sequelize";

const { glDB: db } = require("../config/database");
const Job = require("./Job");

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
    Est_Total_Hrs: {
      type: Sequelize.NUMBER,
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

Operation.belongsTo(Job, {
  foreignKey: "Job",
  as: "job", // Appropriate name
});

module.exports = Operation;
