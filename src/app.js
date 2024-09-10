require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const app = express();

// Middlewares
// app.use(morgan())
// Body parse
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet());
app.use(compression());

//Database
require("./databases/mongodb");

// Router
app.use(require("./routers/index"));

// handling errors
app.use((req, res, next) => {
  const err = new Error("Not found!");
  req.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
