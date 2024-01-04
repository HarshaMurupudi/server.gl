import Sequelize from 'sequelize';
const { glNotesDB: db } = require('../../config/database');

const AttendanceNotes = db.define(
  'Attendance_Notes',
  {
    Attendance_Note_ID: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    Employee: {
      type: Sequelize.STRING,
    },
    First_Name: {
      type: Sequelize.STRING,
    },
    Last_Name: {
      type: Sequelize.STRING,
    },
    Status: {
      type: Sequelize.STRING,
    },
    Login: {
      type: Sequelize.STRING
    },
    Logout: {
      type: Sequelize.STRING
    },
    Attendance_Note: {
      type: Sequelize.STRING
    },
    Note_Date: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false,

    createdAt: false,

    updatedAt: false,

    tableName: 'Attendance_Notes',
  }
);

module.exports = AttendanceNotes;
