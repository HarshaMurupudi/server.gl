import Sequelize from 'sequelize';
const { glNotesDB: db } = require('../../config/database');

const MeetingNotes = db.define(
  'Meeting_Notes',
  {
    Meeting_Note_ID: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },

    Description: {
      type: Sequelize.STRING,
    },
    Date: {
      type: Sequelize.DATE,
    },
    Meeting_Note: {
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

    tableName: 'Meeting_Notes',
  }
);

module.exports = MeetingNotes;
