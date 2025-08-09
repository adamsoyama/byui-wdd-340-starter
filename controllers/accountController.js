const {
  findAccountByEmail,
  registerAccount,
} = require("../models/account-model.js");
const Util = require("../utilities/");
const bcrypt = require("bcrypt");

// Renders the login view
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

// Handles login form submission
async function postLogin(req, res) {
  const { account_email, account_password } = req.body;

  try {
    const account = await findAccountByEmail(account_email);

    if (!account) {
      req.flash("message", "Invalid email or password.");
      return res.redirect("/account/login");
    }

    const match = await bcrypt.compare(
      account_password,
      account.account_password
    );
    if (!match) {
      req.flash("message", "Invalid email or password.");
      return res.redirect("/account/login");
    }

    // Login successful — set session
    req.session.account = {
      id: account.account_id,
      name: account.account_firstname,
      email: account.account_email,
      type: account.account_type,
    };

    return res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).send("Server error");
  }
}

// Renders the registration view
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
    errors: null, // ✅ Prevents EJS crash on first load
    Util, // ✅ Makes Util available in EJS
  });
}

// Handles registration form submission (refactored)
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
        Util, // ✅ Makes Util available in EJS
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
      Util, // ✅ Makes Util available in EJS
    });
  }
}

module.exports = {
  buildLogin,
  postLogin,
  buildRegister,
  postRegister,
};
