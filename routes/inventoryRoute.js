const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
const Util = require("../utilities");

// ==============================
// Inventory Views
// ==============================

// Route to fetch inventory items by classification (e.g., SUVs, Trucks)
router.get(
  "/type/:classificationId",
  Util.handleErrors(invController.buildByClassificationId)
);

// Route to display details of a specific vehicle
router.get(
  "/detail/:invId",
  Util.handleErrors(invController.buildInventoryDetailView)
);

// ==============================
// Inventory Management
// ==============================

// Route to display the inventory management dashboard
router.get("/", Util.handleErrors(invController.buildManagement));

// ==============================
// Add Classification
// ==============================

// Route to display the form for adding a new classification
router.get(
  "/add-classification",
  Util.handleErrors(invController.buildAddClassification)
);

// Route to handle submission of new classification
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  Util.handleErrors(invController.postAddClassification)
);

// ==============================
// Add Vehicle
// ==============================

// Route to display the form for adding a new vehicle
router.get("/add-vehicle", Util.handleErrors(invController.buildAddVehicle));

// Route to handle submission of new vehicle data
router.post(
  "/add-vehicle",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  Util.handleErrors(invController.postAddVehicle)
);

// ==============================
// Edit Vehicle
// ==============================

// Route to display the edit form for a specific inventory item
router.get("/edit/:invId", Util.handleErrors(invController.editInventoryView));

// Route to handle the POST request for updating inventory data
router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  Util.handleErrors(invController.updateVehicle)
);

// ==============================
// Delete Vehicle
// ==============================

// Route to display the delete confirmation view
router.get(
  "/delete/:invId",
  Util.handleErrors(invController.buildDeleteConfirmation)
);

// Route to handle deletion of a vehicle
router.post(
  "/delete/:invId",
  Util.handleErrors(invController.postDeleteInventory)
);

// ==============================
// Inventory JSON API
// ==============================

// Route to return inventory data as JSON by classification
router.get(
  "/getInventory/:classification_id",
  Util.handleErrors(invController.getInventoryJSON)
);

// ==============================
// Error Testing Route
// ==============================

// Route to intentionally trigger an error for testing
router.get(
  "/trigger-error",
  Util.handleErrors(async (req, res) => {
    throw new Error("Intentional server error for testing.");
  })
);

module.exports = router;
