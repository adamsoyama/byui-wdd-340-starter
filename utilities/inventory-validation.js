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

// Check update inventory data and redirect to edit view if errors
function checkUpdateData(req, res, next) {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav: res.locals.nav,
      classificationSelect: Util.buildClassificationList(classification_id),
      errors: errors.array(),
      message: null,
      errorMessage: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
  next();
}

module.exports = invValidate;
