import Sequelize from "sequelize";

const { glDB: db } = require("../config/database");
const Employee = require("./Employee");

const OperationTime = db.define(
  "OperationTime",
  {
    Job_Operation: {
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    Employee: {
      type: Sequelize.STRING,
    },
    Act_Setup_Hrs: {
      type: Sequelize.FLOAT,
    },
    Act_Run_Hrs: {
      type: Sequelize.FLOAT,
    },
    Act_Run_Qty: {
      type: Sequelize.INTEGER,
    },
    Act_Scrap_Qty: {
      type: Sequelize.INTEGER,
    },
    Work_Date: {
      type: Sequelize.DATE,
    },
  },
  {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,

    // If don't want createdAt
    createdAt: false,

    // If don't want updatedAt
    updatedAt: false,

    tableName: "Job_Operation_Time",
  }
);

OperationTime.belongsTo(Employee, {
  foreignKey: "Employee",
  as: 'employee', // Appropriate name
});

module.exports = OperationTime;
