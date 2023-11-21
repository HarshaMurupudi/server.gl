import Sequelize from 'sequelize';
const { glNotesDB: db } = require('../../config/database');

const EmployeeReviewNotes = db.define(
  'Employee_Review',
  {
    Review_ID: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    Employee: {
      type: Sequelize.STRING,
    },
    Date: {
      type: Sequelize.STRING,
    },
    Report_Type: {
      type: Sequelize.STRING,
    },
    Report_Note: {
      type: Sequelize.STRING,
    },
    Review_Note: {
      type: Sequelize.STRING,
    },
    Reviewed_By: {
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

    tableName: 'Employee_Review',
  }
);

module.exports = EmployeeReviewNotes;
