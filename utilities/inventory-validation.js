const { body, validationResult } = require("express-validator");
const Util = require("./");

const invValidate = {};

invValidate.classificationRules = () => [
  body("classification_name")
    .trim()
    .escape()
    .toLowerCase()
    .notEmpty()
    .withMessage("Classification name is required.")
    .isLength({ min: 3 })
    .withMessage("Must be at least 3 characters."),
];

invValidate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await Util.getNav(req, res);
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: null,
      errorMessage: null,
      errors: errors.array(),
      Util,
    });
    return;
  }
  next();
};

invValidate.inventoryRules = () => [
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1900 }).withMessage("Valid year required."),
  body("inv_price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number."),
  body("classification_id").isInt().withMessage("Classification is required."),
];

invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    req.flash("formData", req.body);
    return res.redirect("/inv/add-vehicle");
  }
  next();
};

module.exports = invValidate;
