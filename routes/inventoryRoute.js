const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
const Util = require("../utilities");
const checkInventoryAccess = require("../utilities/checkInventoryAccess");

// ==============================
// Inventory Views (Public)
// ==============================

// View inventory by classification
router.get(
  "/type/:classificationId",
  Util.handleErrors(invController.buildByClassificationId)
);

// View inventory detail
router.get(
  "/detail/:invId",
  Util.handleErrors(invController.buildInventoryDetailView)
);

// ==============================
// Inventory Management Dashboard (Protected)
// ==============================

router.get(
  "/",
  checkInventoryAccess,
  Util.handleErrors(invController.buildManagement)
);

// ==============================
// Add Classification (Protected)
// ==============================

router.get(
  "/add-classification",
  checkInventoryAccess,
  Util.handleErrors(invController.buildAddClassification)
);

router.post(
  "/add-classification",
  checkInventoryAccess,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  Util.handleErrors(invController.postAddClassification)
);

// ==============================
// Add Vehicle (Protected)
// ==============================

router.get(
  "/add-vehicle",
  checkInventoryAccess,
  Util.handleErrors(invController.buildAddVehicle)
);

router.post(
  "/add-vehicle",
  checkInventoryAccess,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  Util.handleErrors(invController.postAddVehicle)
);

// ==============================
// Edit Vehicle (Protected)
// ==============================

router.get(
  "/edit/:invId",
  checkInventoryAccess,
  Util.handleErrors(invController.editInventoryView)
);

router.post(
  "/update",
  checkInventoryAccess,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  Util.handleErrors(invController.updateVehicle)
);

// ==============================
// Delete Vehicle (Protected)
// ==============================

router.get(
  "/delete/:invId",
  checkInventoryAccess,
  Util.handleErrors(invController.buildDeleteConfirmation)
);

router.post(
  "/delete/:invId",
  checkInventoryAccess,
  Util.handleErrors(invController.postDeleteInventory)
);

// ==============================
// Inventory JSON API (Protected)
// ==============================

router.get(
  "/getInventory/:classification_id",
  checkInventoryAccess,
  Util.handleErrors(invController.getInventoryJSON)
);

// ==============================
// Error Testing Route (Optional)
// ==============================

router.get(
  "/trigger-error",
  checkInventoryAccess,
  Util.handleErrors(async (req, res) => {
    throw new Error("Intentional server error for testing.");
  })
);

module.exports = router;
