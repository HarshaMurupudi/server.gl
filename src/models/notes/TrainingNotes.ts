import Sequelize from 'sequelize';
const { glNotesDB: db } = require('../../config/database');

const TrainingNotes = db.define(
  'Master_Training',
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
    Training_Title: {
        type: Sequelize.STRING,
      },
    Training_Type: {
      type: Sequelize.STRING,
    },
    Training_Description: {
      type: Sequelize.STRING,
    }
  },
  {
    timestamps: false,

    createdAt: false,

    updatedAt: false,

    tableName: 'Master_Training',
  }
);

module.exports = TrainingNotes;
