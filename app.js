require("dotenv").config({ debug: process.env.DEBUG });
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const Angels = require('./src/model/Angels')
const exphbs = require("express-handlebars");
const db = require("./src/config/database")

var indexRouter = require('./src/routes/index');
require('./src/config/paypal')

const port = process.env.PORT || 3000;
var app = express();

db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/css",
  express.static(path.join(__dirname, "/node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "/node_modules/bootstrap/dist/js"))
);
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("views", "./src/views");
app.set("view engine", "handlebars");

app.use('/api', indexRouter);

app.get('/', async (req, res)=>{
  let data;
  Angels.findAll().then(angels => {
    data = JSON.parse(JSON.stringify(angels, null, 4));
    console.log(data)
    res.render('index',{data})
  });
  
  
})
app.server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

module.exports = app;
