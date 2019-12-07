const Sequelize = require("sequelize");

module.exports = new Sequelize("binghanaDB", "postgres", "enset", {
  host: "localhost",
  dialect: "postgres",
  operatorsAliasses: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
