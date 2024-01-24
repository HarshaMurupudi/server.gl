import Sequelize from "sequelize";
const { glNotesDB: db } = require("../../config/database");

const DiecutNotes = db.define(
  "SPC_Diecut",
  {
    Die_ID: {
      primaryKey: true,
      type: Sequelize.STRING,
      autoIncrement: true,
    },
    Die_Number: {
      type: Sequelize.STRING,
    },
    Date: {
      type: Sequelize.INTEGER,
    },
    Art_Number: {
      type: Sequelize.INTEGER,
    },
    Part_Number: {
      type: Sequelize.STRING,
    },
    Material: {
      type: Sequelize.STRING,
    },
    Lamination: {
      type: Sequelize.STRING,
    },
    Impressions: {
      type: Sequelize.STRING,
    },
    Adhesive: {
      type: Sequelize.STRING,
    },
    Cut_Type: {
      type: Sequelize.STRING,
    },
    Press: {
      type: Sequelize.STRING,
    },
    Makeready: {
      type: Sequelize.STRING,
    },
    Pad: {
      type: Sequelize.STRING,
    },
    Platen: {
      type: Sequelize.STRING,
    },
    Signature: {
      type: Sequelize.STRING,
    },
    Note: {
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

    tableName: "SPC_Diecut",
  }
);

module.exports = DiecutNotes;