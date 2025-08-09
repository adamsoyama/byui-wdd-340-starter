const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
const Util = require("../utilities");

// Inventory Views
router.get(
  "/type/:classificationId",
  Util.handleErrors(invController.buildByClassificationId)
);
router.get(
  "/detail/:invId",
  Util.handleErrors(invController.buildInventoryDetailView)
);

// Management View
router.get("/", Util.handleErrors(invController.buildManagement));

// Add Classification
router.get(
  "/add-classification",
  Util.handleErrors(invController.buildAddClassification)
);
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  Util.handleErrors(invController.postAddClassification)
);

// Add Vehicle
router.get("/add-vehicle", Util.handleErrors(invController.buildAddVehicle));
router.post(
  "/add-vehicle",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  Util.handleErrors(invController.postAddVehicle)
);

// Error Testing
router.get(
  "/trigger-error",
  Util.handleErrors(async (req, res) => {
    throw new Error("Intentional server error for testing.");
  })
);

module.exports = router;
