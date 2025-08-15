const {
  findAccountByEmail,
  registerAccount,
  getAccountById,
  updateAccountDetails,
  updateAccountPassword,
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

    if (
      !account ||
      !(await bcrypt.compare(account_password, account.account_password))
    ) {
      req.flash("message", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        loginForm: Util.buildLoginForm({ account_email }),
        message: req.flash("message"),
        errorMessage: null,
      });
    }

    delete account.account_password;

    const token = jwt.sign(account, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    const tokenName = process.env.TOKEN_COOKIE_NAME || "jwt";
    res.cookie(tokenName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    req.session.account = {
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      account_type: account.account_type,
    };

    req.session.loggedin = true;
    req.session.account_id = account.account_id;
    req.session.accountFirstname = account.account_firstname;

    return res.redirect("/account");
  } catch (error) {
    req.flash("message", "Login failed. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      loginForm: Util.buildLoginForm({ account_email }),
      message: req.flash("message"),
      errorMessage: null,
    });
  }
}

/**
 * Logs out the user and destroys session
 */
function logout(req, res) {
  const tokenName = process.env.TOKEN_COOKIE_NAME || "jwt";
  res.clearCookie(tokenName);
  req.session.destroy(() => {
    res.redirect("/");
  });
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
    const message = req.flash("message");
    const errorMessage = req.flash("errorMessage");

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      message,
      errorMessage,
      account: req.session.account,
    });
  } catch (error) {
    res.status(500).render("error", {
      title: "Server Error",
      message: "Unable to load account management view",
      error,
    });
  }
}

/**
 * Renders the update account view
 */
async function buildUpdateAccountView(req, res) {
  const accountId = req.session.account_id;
  const nav = await Util.getNav(req, res);
  const account = await getAccountById(accountId);

  if (!account) {
    throw new Error("Account not found");
  }

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    account,
    message: req.flash("message"),
    errorMessage: req.flash("errorMessage"),
    data: req.flash("data")[0] || null,
  });
}

/**
 * Handles account info update
 */
async function postUpdateAccount(req, res) {
  const accountId = req.session.account_id;
  const { firstname, lastname, email } = req.body;

  try {
    const existing = await findAccountByEmail(email);
    if (existing && existing.account_id !== accountId) {
      req.flash("errorMessage", "Email already exists.");
      req.flash("data", req.body);
      return res.redirect("/account/update-account");
    }

    await updateAccountDetails(accountId, { firstname, lastname, email });

    req.session.account.account_firstname = firstname;
    req.session.account.account_lastname = lastname;
    req.session.account.account_email = email;

    req.flash("message", "Account updated successfully.");
    return res.redirect("/account/update-account");
  } catch (error) {
    req.flash("errorMessage", "Failed to update account.");
    req.flash("data", req.body);
    return res.redirect("/account/update-account");
  }
}

/**
 * Handles password change
 */
async function postChangePassword(req, res) {
  const accountId = req.session.account_id;
  const { password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await updateAccountPassword(accountId, hashedPassword);

    req.flash("message", "Password updated successfully.");
    return res.redirect("/account/update-account");
  } catch (error) {
    req.flash("errorMessage", "Failed to update password.");
    return res.redirect("/account/update-account");
  }
}

module.exports = {
  buildLogin,
  postLogin,
  buildRegister,
  postRegister,
  buildAccountManagement,
  buildUpdateAccountView,
  postUpdateAccount,
  postChangePassword,
  logout,
};
