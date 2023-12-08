import Sequelize from 'sequelize';
const { glNotesDB: db } = require('../../config/database');

const ImprovementRequest = db.define(
  'Improvement_Request',
  {
    Request_ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    Subject: {
      type: Sequelize.STRING,
    },
    Part_Number: {
      type: Sequelize.STRING,
    },
    Job_Number: {
      type: Sequelize.STRING,
    },
    Work_Center: {
      type: Sequelize.STRING,
    },
    Priority: {
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

    tableName: 'Improvement_Request',
  }
);

module.exports = ImprovementRequest;
