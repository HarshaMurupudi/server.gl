import Sequelize from "sequelize";
const { glNotesDB: db } = require("../../config/database");

const VendorNotes = db.define(
  "Vendor_Notes",
  {
    Vendor_Note_ID: {
      primaryKey: true,
      type: Sequelize.STRING,
      autoIncrement: true,
    },
    Job: {
      type: Sequelize.STRING,
    },
    Job_OperationKey: {
      type: Sequelize.INTEGER,
    },
    Plan_Notes: {
      type: Sequelize.STRING,
    },
    Priority: {
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

    tableName: "Vendor_Notes",
  }
);

module.exports = VendorNotes;
