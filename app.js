require("dotenv").config({ debug: process.env.DEBUG }); // Early request for environnement varialbles config
var express = require('express');
var path = require('path');
var logger = require('morgan');
const Angels = require('./src/model/Angels') // Contributors model
const exphbs = require("express-handlebars");
const db = require("./src/config/database") // DB config file

var indexRouter = require('./src/routes/index'); 
require('./src/config/paypal') // Paypal config file

const port = process.env.PORT || 3000;
var app = express();

// DB Connection
db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

  // Middleware
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
// Handlebars template engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("views", "./src/views");
app.set("view engine", "handlebars");


// api enpoint middleware
app.use('/api', indexRouter);


// load availble cotributor from DB on home page
app.get('/', async (req, res)=>{
  let data;
  Angels.findAll().then(angels => {
    data = JSON.parse(JSON.stringify(angels, null, 4));
    console.log(data)
    res.render('index',{data})
  });
  
  
})

// Open express server connection
app.server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

module.exports = app;
