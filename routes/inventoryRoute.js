// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities"); // Add this line

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory detail view by vehicle ID
router.get("/detail/:invId", invController.buildInventoryDetailView);

// Intentional error route for testing
router.get(
  "/trigger-error",
  utilities.handleErrors(async (req, res, next) => {
    throw new Error("Intentional server error for testing.");
  })
);

module.exports = router;
