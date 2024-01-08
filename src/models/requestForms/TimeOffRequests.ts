import Sequelize from 'sequelize';
const { glNotesDB: db } = require('../../config/database');

const TimeOffRequest = db.define(
  'Time_Off_Request',
  {
    Request_ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Request_Type: {
        type: Sequelize.STRING
    },
    Submission_Date: {
      type: Sequelize.STRING,
    },
    Status: {
      type: Sequelize.STRING,
    },
    Initiator: {
      type: Sequelize.STRING,
    },
    Start_Date: {
      type: Sequelize.STRING
    },
    End_Date: {
        type: Sequelize.STRING
    },
    Request: {
      type: Sequelize.STRING
    },
    Approver: {
      type: Sequelize.STRING
    },
    Approval_Comment: {
      type: Sequelize.STRING
    },
    Approval_Date: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false,

    createdAt: false,

    updatedAt: false,

    tableName: 'Time_Off_Request',
  }
);

module.exports = TimeOffRequest;
