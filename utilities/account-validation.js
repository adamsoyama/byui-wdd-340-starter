const Util = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/* **********************************
 * Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // First name
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .bail(),

    // Last name
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.")
      .bail(),

    // Email
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

    // Password
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
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await Util.getNav(req, res);
    const formData = req.body;
    const registerForm = Util.buildRegisterForm(formData);

    res.render("account/register", {
      title: "Register",
      nav,
      registerForm,
      formData,
      errors: errors.array(), // ✅ Flattened for EJS
      message: null,
      errorMessage: null,
      Util, // ✅ Required for EJS to use Util.buildRegisterForm
    });
    return;
  }
  next();
};

function inventoryValidationRules() {
  return [
    body("inv_make").trim().notEmpty().withMessage("Make is required"),
    body("inv_model").trim().notEmpty().withMessage("Model is required"),
    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Enter a valid year"),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("inv_miles")
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer"),
    body("classification_id")
      .isInt()
      .withMessage("Select a valid classification"),
  ];
}

/**
 * Validation rules for login
 */
const loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/**
 * Check login validation results
 */
const checkLoginData = (req, res, next) => {
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

validate.loginRules = loginRules;
validate.checkLoginData = checkLoginData;

module.exports = validate;
