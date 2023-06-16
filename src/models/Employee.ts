import Sequelize from 'sequelize';
const { glDB: db } = require('../config/database');

const Employee = db.define(
  'Employee',
  {
    Employee: {
      primaryKey: true,
      type: Sequelize.STRING,
    },

    SSN: {
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
    tableName: 'Employee',
    freezeTableName: true,
  }
);

module.exports = Employee;
