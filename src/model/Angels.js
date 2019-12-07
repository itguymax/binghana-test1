const Sequelize = require("sequelize");

const db = require("../config/database");

const Angels = db.define("angels", {
  name: {
    type: Sequelize.STRING,
    allowNull: true
  },

  profile_url: {
    type: Sequelize.STRING,
    allowNull: true
  },

  amount: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  address: {
    type: Sequelize.STRING,
    allowNull: true
  },
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  }
});

module.exports = Angels;
