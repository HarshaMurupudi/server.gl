import Sequelize from 'sequelize';
const { glNotesDB: db } = require('../config/database');

const NotesFinal = db.define(
  'Notes_Final',
  {
    Job: {
      primaryKey: true,
      type: Sequelize.STRING,
    },
    Ship_By_Date: {
      primaryKey: true,
      type: Sequelize.STRING,
    },
    Production_Notes: {
      type: Sequelize.STRING,
    },
    Sales_Notes: {
      type: Sequelize.STRING,
    },
    Engineering_Notes: {
      type: Sequelize.STRING,
    },
    Job_Plan: {
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

    tableName: 'Notes_Final',
  }
);

module.exports = NotesFinal;
