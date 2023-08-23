import Sequelize from "sequelize";
const { glDB: db } = require("../config/database");

const Delivery = db.define(
  "Delivery",
  {
    DeliveryKey: {
      primaryKey: true,
      type: Sequelize.STRING,
    },
    Job: {
      type: Sequelize.STRING,
    },
    Packlist: {
      type: Sequelize.STRING,
    },
    Promised_Date: {
      type: Sequelize.DATE,
    },
  },
  {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,

    // If don't want createdAt
    createdAt: false,

    // If don't want updatedAt
    updatedAt: false,

    tableName: "Delivery",
  }
);

module.exports = Delivery;
