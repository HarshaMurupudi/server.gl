"use strict";
const Sequelize = require('sequelize');
const { glDB: db } = require('../config/database');
const Job = db.define('Job', {
    Job: {
        primaryKey: true,
        type: Sequelize.STRING,
    },
    Part_Number: {
        type: Sequelize.STRING,
    },
    // Sales_Rep: {
    //   type: Sequelize.STRING,
    // },
    Customer: {
        type: Sequelize.BOOLEAN,
    },
    Status: {
        type: Sequelize.STRING,
    },
    Description: {
        type: Sequelize.STRING,
    },
    Order_Quantity: {
        type: Sequelize.INTEGER,
    },
    Completed_Quantity: {
        type: Sequelize.INTEGER,
    },
    Released_Date: {
        type: Sequelize.DATE,
    },
}, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
    // If don't want createdAt
    createdAt: false,
    // If don't want updatedAt
    updatedAt: false,
    tableName: 'Job',
});
module.exports = Job;
