import Sequelize from 'sequelize';
const { glDB: db } = require('../config/database');

const Attendance = db.define(
  'Attendance',
  {
    Employee: {
      primaryKey: true,
      type: Sequelize.STRING,
    },
    First_Name: {
      type: Sequelize.STRING,
    },
    Last_Name: {
      type: Sequelize.STRING,
    },
    Login: {
      type: Sequelize.DATE
    }
    Logout: {
      type: Sequelize.DATE
    }
  },
  {
    timestamps: false,

    createdAt: true,

    updatedAt: false,
    tableName: 'Attendance',
    freezeTableName: true,
  }
);

module.exports = Attendance;
