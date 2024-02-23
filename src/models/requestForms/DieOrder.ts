import Sequelize from 'sequelize';
const { glNotesDB: db } = require('../../config/database');

const DieOrder = db.define(
  'Die_Order',
  {
    Die_ID: {
      type: Sequelize.INTEGER,
      primaryKey: false,
      autoIncrement: true,
    },
		Tool_ID: {
			type: Sequelize.STRING,
      primaryKey: true,
		},
    Status: {
      type: Sequelize.STRING,
    },
    Inspection_Status: {
      type: Sequelize.STRING,
    },
    PO_Number: {
      type: Sequelize.STRING,
    },
    Tool_Type: {
      type: Sequelize.STRING,
    },
    Tool_Shape: {
      type: Sequelize.STRING,
    },
    Tool_Description: {
      type: Sequelize.STRING,
    },
    Cavity_Width: {
      type: Sequelize.STRING,
    },
    Cavity_Height: {
      type: Sequelize.STRING
    },
    Cavities_Across: {
    	type: Sequelize.STRING,
    },
    Cavities_Down: {
      type: Sequelize.STRING
    },
		Cavities_Total: {
      type: Sequelize.STRING
    },
		Space_Across: {
			type: Sequelize.STRING
		},
		Space_Down: {
			type: Sequelize.STRING
		},
    Radius: {
      type: Sequelize.STRING
    },
		Vendor: {
      type: Sequelize.STRING
    },
		Comment: {
      type: Sequelize.STRING
    },
    Approver: {
      type: Sequelize.STRING
    },
    Approval_Comment: {
      type: Sequelize.STRING
    },
    Approval_Date: {
      type: Sequelize.STRING
    },

  },
  {
    timestamps: false,

    createdAt: false,

    updatedAt: false,

    tableName: 'Die_Order',
  }
);

module.exports = DieOrder;
