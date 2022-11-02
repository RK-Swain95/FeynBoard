const express = require("express");
//server name
const app = express();
const port = 8000;
const cookieparser=require('cookie-parser');
const expressLayouts = require("express-ejs-layouts");
const db = require("./config/mongoose");
const passport = require("passport");
const passportJwt = require("./config/passport-jwt-stregdy");

//use the body
app.use(express.urlencoded());
app.use(cookieparser());
app.use(expressLayouts);
//extract style and scripts from sub pages into the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);
//set up view engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/", require("./routes"));
app.use(passport.initialize());

//calling the server
app.listen(port, function (err) {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }

  console.log(`Server is running on port: ${port}`);
});
