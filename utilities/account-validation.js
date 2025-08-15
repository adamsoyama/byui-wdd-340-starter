const Util = require(".");
const { body, validationResult } = require("express-validator");

const validate = {};

/* ────────────────────────────────
 * Registration Validation Rules
 * ──────────────────────────────── */
validate.registrationRules = () => [
  body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a first name.")
    .bail(),

  body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a last name.")
    .bail(),

  body("account_email")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("A valid email is required.")
    .bail()
    .normalizeEmail(),

  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 12 characters and include an uppercase letter, a number, and a special character."
    ),
];

validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await Util.getNav(req, res);
    const formData = req.body;
    const registerForm = Util.buildRegisterForm(formData);

    return res.render("account/register", {
      title: "Register",
      nav,
      registerForm,
      formData,
      errors: errors.array(),
      message: null,
      errorMessage: null,
      Util,
    });
  }
  next();
};

/* ────────────────────────────────
 * Update Account Validation Rules
 * ──────────────────────────────── */
validate.updateAccountRules = () => [
  body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("First name is required."),

  body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Last name is required."),

  body("account_email")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail(),
];

validate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await Util.getNav(req, res);
    const account = req.session.account;
    const data = req.body;

    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      account,
      data,
      errors: errors.array(),
      message: null,
      errorMessage: null,
    });
  }
  next();
};

/* ────────────────────────────────
 * Password Change Validation Rules
 * ──────────────────────────────── */
validate.passwordRules = () => [
  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 12 characters and include an uppercase letter, a number, and a special character."
    ),
];

validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await Util.getNav(req, res);
    const account = req.session.account;

    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      account,
      data: {},
      errors: errors.array(),
      message: null,
      errorMessage: null,
    });
  }
  next();
};

/* ────────────────────────────────
 * Login Validation Rules
 * ──────────────────────────────── */
validate.loginRules = () => [
  body("account_email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required."),

  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required."),
];

validate.checkLoginData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "errorMessage",
      errors.array().map((e) => e.msg)
    );
    req.flash("formData", req.body);
    return res.redirect("/account/login");
  }
  next();
};

module.exports = validate;
