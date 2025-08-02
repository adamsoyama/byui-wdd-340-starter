const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build inventory detail view by vehicle ID
 * ************************** */
invCont.buildInventoryDetailView = async function (req, res, next) {
  const invId = parseInt(req.params.invId);
  try {
    const vehicle = await invModel.getVehicleById(invId);
    if (!vehicle) {
      return res.status(404).send("Vehicle not found");
    }

    const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle);
    const nav = await utilities.getNav();

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
