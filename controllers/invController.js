const { validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const Util = require("../utilities");

const invCont = {};

// Build inventory by classification ID
invCont.buildByClassificationId = async function (req, res) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await Util.buildClassificationGrid(data);
  const nav = await Util.getNav(req, res);
  const className = data[0].classification_name;
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

// Build inventory detail view
invCont.buildInventoryDetailView = async function (req, res) {
  const invId = parseInt(req.params.invId);
  const vehicle = await invModel.getVehicleById(invId);
  const vehicleHTML = Util.buildVehicleDetailHTML(vehicle);
  const nav = await Util.getNav(req, res);
  res.render("inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicleHTML,
  });
};

// Build inventory management view
invCont.buildManagement = async function (req, res) {
  const nav = await Util.getNav(req, res);
  const classificationSelect = await Util.buildClassificationList();
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    message: req.flash("message"),
    errorMessage: req.flash("errorMessage"),
  });
};

// Render add classification form
invCont.buildAddClassification = async function (req, res) {
  const nav = await Util.getNav(req, res);
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    message: req.flash("message"),
    errorMessage: req.flash("errorMessage"),
    errors: [],
    Util,
  });
};

// Handle add classification POST
invCont.postAddClassification = async function (req, res) {
  const { classification_name } = req.body;
  try {
    await invModel.addClassification(classification_name);
    req.flash("message", "Classification added successfully.");
    res.redirect("/inv");
  } catch (error) {
    const nav = await Util.getNav(req, res);
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: null,
      errorMessage: ["Failed to add classification."],
      Util,
    });
  }
};

// Render add vehicle form
invCont.buildAddVehicle = async function (req, res) {
  const nav = await Util.getNav(req, res);
  const classifications = await invModel.getClassifications();
  const errors = req.flash("errors");
  const formData = req.flash("formData")[0] || {};
  res.render("inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classifications: classifications.rows,
    errors,
    formData,
    message: req.flash("message"),
    errorMessage: req.flash("errorMessage"),
    Util,
  });
};

// Handle add vehicle POST
invCont.postAddVehicle = async function (req, res) {
  const formData = req.body;
  const result = await invModel.addInventoryItem(formData);

  if (result) {
    req.flash("message", "Vehicle added successfully.");
    res.redirect("/inv");
  } else {
    req.flash("errorMessage", "Failed to add vehicle.");
    req.flash("formData", formData);
    res.redirect("/inv/add-vehicle");
  }
};

// Return inventory JSON by classification ID
invCont.getInventoryJSON = async function (req, res) {
  const classification_id = req.params.classification_id;
  try {
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory data." });
  }
};

// Build edit inventory view
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId);

  try {
    const nav = await Util.getNav(req, res);
    const itemData = await invModel.getVehicleById(inv_id);

    if (!itemData) {
      const error = new Error("Inventory item not found");
      error.status = 404;
      return next(error);
    }

    const classificationSelect = await Util.buildClassificationList(
      itemData.classification_id
    );
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: req.flash("errors") || [],
      message: req.flash("message")[0] || "",
      errorMessage: req.flash("errorMessage")[0] || "",
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
      inv_transmission: itemData.inv_transmission,
    });
  } catch (err) {
    next(err);
  }
};

// Handle inventory update POST
invCont.updateVehicle = async function (req, res, next) {
  const errors = validationResult(req);
  const nav = await Util.getNav(req, res);

  let {
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

  inv_id = parseInt(inv_id);

  const formData = {
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
  };

  if (!errors.isEmpty()) {
    const classificationSelect = await Util.buildClassificationList(
      classification_id
    );
    req.flash("errors", errors.array());
    req.flash("formData", formData);
    return res.status(400).render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      classificationSelect,
      errors: errors.array(),
      message: null,
      errorMessage: "Validation failed. Please correct the errors.",
      ...formData,
    });
  }

  try {
    const updateResult = await invModel.updateInventory(formData);

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model;
      req.flash("message", `The ${itemName} was successfully updated.`);
      res.redirect("/inv");
    } else {
      const classificationSelect = await Util.buildClassificationList(
        classification_id
      );
      req.flash("errorMessage", "Sorry, the update failed.");
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + inv_make + " " + inv_model,
        nav,
        classificationSelect,
        errors: null,
        message: null,
        errorMessage: req.flash("errorMessage")[0],
        ...formData,
      });
    }
  } catch (err) {
    console.error("Controller error:", err);
    req.flash("errorMessage", "An unexpected error occurred.");
    res.redirect(`/inv/edit/${inv_id}`);
  }
};

// ==============================
// Build delete confirmation view
// ==============================
invCont.buildDeleteConfirmation = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId);

  try {
    const nav = await Util.getNav(req, res);
    const vehicle = await invModel.getVehicleById(inv_id);

    if (!vehicle) {
      const error = new Error("Inventory item not found");
      error.status = 404;
      return next(error);
    }

    const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`;

    res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      vehicle,
      errors: [],
      message: req.flash("message")[0] || "",
      errorMessage: req.flash("errorMessage")[0] || "",
    });
  } catch (err) {
    next(err);
  }
};

// ==============================
// Handle inventory delete POST
// ==============================
invCont.postDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);

  try {
    const deleteResult = await invModel.deleteVehicleById(inv_id);

    if (deleteResult) {
      req.flash("message", "Vehicle deleted successfully.");
      res.redirect("/inv");
    } else {
      req.flash("errorMessage", "Failed to delete vehicle.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (err) {
    console.error("Delete error:", err);
    req.flash("errorMessage", "An unexpected error occurred during deletion.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
};

module.exports = invCont;
