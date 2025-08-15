/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const pool = require("./database/");
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const Util = require("./utilities");
const cookieParser = require("cookie-parser");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Middleware
 *************************/

// Session middleware with PostgreSQL store
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Flash messages middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use((req, res, next) => {
  res.locals.loggedin = req.session.loggedin || false;
  res.locals.accountFirstname = req.session.accountFirstname || null;
  next();
});

// Body parser middleware
// I saw from research that express from version 4.16.0 onwards has built-in body parsing
// capabilities, so we can use express.json() and express.urlencoded() directly.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//If we did not have express version 4.61 or above, we would have used
// body parser as commented out below:

// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// Cookie middleware
app.use(cookieParser());

/* ***********************
 * Static Routes
 *************************/
app.use(static);

/* ***********************
 * Main Routes
 *************************/
app.get("/", Util.handleErrors(baseController.buildHome)); // ✅ Error wrapper
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);

/* ***********************
 * File Not Found Route - must be last route in list
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Ooops! The page can't be found." });
});

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await Util.getNav(req, res); // ✅ Updated to use 'Util'
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const message =
    err.status === 404
      ? err.message
      : "Oh no! Something went wrong. Please try a different route.";
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
