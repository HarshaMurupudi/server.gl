import Sequelize from 'sequelize';
const { glDB: db } = require('../config/database');

const Customer = db.define(
  'Customer',
  {
    Customer: {
      primaryKey: true,
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

    tableName: 'Customer',
  }
);

module.exports = Customer;
