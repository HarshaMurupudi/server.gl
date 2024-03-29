import Sequelize from 'sequelize';
const { glNotesDB: db } = require('../../config/database');

const TrainingLogNotes = db.define(
  'Training_Log',
  {
    Training_ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Date: {
      type: Sequelize.STRING,
    },
    Trainer: {
      type: Sequelize.STRING,
    },
    Employee_Name: {
        type: Sequelize.STRING,
      },
    Training_Title: {
      type: Sequelize.STRING,
    },
    Needs_Repeat: {
      type: Sequelize.STRING,
    },
    Repeat_After: {
      type: Sequelize.STRING
    },
    Note: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false,

    createdAt: false,

    updatedAt: false,

    tableName: 'Training_Log',
  }
);

module.exports = TrainingLogNotes;
