const {
  findAccountByEmail,
  registerAccount,
} = require("../models/account-model.js");
const Util = require("../utilities/");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Renders the login view
 */
async function buildLogin(req, res) {
  const nav = await Util.getNav(req, res);
  const loginForm = Util.buildLoginForm();
  res.render("account/login", {
    title: "Login",
    nav,
    loginForm,
    message: req.flash("message"),
    errorMessage: req.flash("errorMessage"),
  });
}

/**
 * Process login request
 */
async function postLogin(req, res) {
  const { account_email, account_password } = req.body;
  const nav = await Util.getNav(req, res);

  try {
    const account = await findAccountByEmail(account_email);

    if (!account) {
      req.flash("message", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        loginForm: Util.buildLoginForm({ account_email }),
        message: req.flash("message"),
        errorMessage: null,
      });
    }

    const match = await bcrypt.compare(
      account_password,
      account.account_password
    );
    if (!match) {
      req.flash("message", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        loginForm: Util.buildLoginForm({ account_email }),
        message: req.flash("message"),
        errorMessage: null,
      });
    }

    // Remove sensitive data
    delete account.account_password;

    // Generate JWT
    const token = jwt.sign(account, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    // Set session
    req.session.account = {
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      account_type: account.account_type,
    };

    return res.redirect("/account");
  } catch (error) {
    console.error("Login error:", error.message);
    req.flash("errorMessage", "Login failed. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      loginForm: Util.buildLoginForm({ account_email }),
      message: null,
      errorMessage: req.flash("errorMessage"),
    });
  }
}

/**
 * Renders the registration view
 */
async function buildRegister(req, res) {
  const nav = await Util.getNav(req, res);
  const formData = req.flash("formData")[0] || {};
  const registerForm = Util.buildRegisterForm(formData);
  res.render("account/register", {
    title: "Register",
    nav,
    registerForm,
    message: req.flash("message"),
    errorMessage: req.flash("errorMessage"),
    formData,
    errors: null,
    Util,
  });
}

/**
 * Handles registration form submission
 */
async function postRegister(req, res) {
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  try {
    const existingAccount = await findAccountByEmail(account_email);
    if (existingAccount) {
      const nav = await Util.getNav(req, res);
      return res.render("account/register", {
        title: "Register",
        nav,
        formData: req.body,
        message: null,
        errorMessage: ["Email already registered."],
        registerForm: Util.buildRegisterForm(req.body),
        errors: null,
        Util,
      });
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);

    await registerAccount({
      account_firstname,
      account_lastname,
      account_email,
      account_password: hashedPassword,
    });

    req.flash("message", "Registration successful. Please log in.");
    return res.redirect("/account/login");
  } catch (error) {
    console.error("Registration error:", error.message);
    const nav = await Util.getNav(req, res);
    return res.render("account/register", {
      title: "Register",
      nav,
      formData: req.body,
      message: null,
      errorMessage: ["Registration failed. Please try again."],
      registerForm: Util.buildRegisterForm(req.body),
      errors: null,
      Util,
    });
  }
}

/**
 * Build account management view
 */
async function buildAccountManagement(req, res) {
  try {
    const nav = await Util.getNav(req, res);
    const flashMessage = req.flash("info");
    const errors = req.flash("error");

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      message: "You're logged in",
      flashMessage,
      errors,
      account: req.session.account, // ✅ Pass session data to view
    });
  } catch (error) {
    res.status(500).render("error", {
      title: "Server Error",
      message: "Unable to load account management view",
      error,
    });
  }
}

module.exports = {
  buildLogin,
  postLogin,
  buildRegister,
  postRegister,
  buildAccountManagement,
};
