#!/usr/bin/env node
/* eslint no-console: 0 */
/* eslint arrow-body-style: [2, "always"]*/

const express = require("express");
const http = require("http");
const path = require("path");
// const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const routes = require("./routes/index");
const users = require("./routes/users");
const analysis = require("./routes/media-analysis");
const black = require("./routes/black");
const mono = require("./routes/mono");

// TODO use bunyon instead of winston


const app = express();

// view engine setup
app.set("views", path.join(__dirname, "client"));
// app.set("view engine", "hbs");
app.set("view engine", "html");

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, " +
    "xa-file-to-concat, xa-black-position, xa-chunk-position");

  next();
});

app.use(bodyParser.raw({
  limit: "500mb"
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/users", users);
app.use("/analysis", analysis);
app.use("/black", black);
app.use("/mono", mono);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    console.log("this is my error from dev env:");
    console.log(err);
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  console.log("this is my error prod env:");
  console.log(err);
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    // mc hack: error should be an empty object
    error: err
  });
});

module.exports = app;
