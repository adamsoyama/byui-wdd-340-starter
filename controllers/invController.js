const invModel = require("../models/inventory-model");
const Util = require("../utilities");

const invCont = {};

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

invCont.buildManagement = async function (req, res) {
  const nav = await Util.getNav(req, res);
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    message: req.flash("message"),
    errorMessage: req.flash("errorMessage"),
  });
};

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

invCont.postAddVehicle = async function (req, res) {
  const formData = req.body;
  const classifications = await invModel.getClassifications();
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

module.exports = invCont;
