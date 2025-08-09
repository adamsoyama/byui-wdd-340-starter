// Needed Resources
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const Util = require("../utilities"); // ✅ Renamed from 'utilities' to 'Util'
const regValidate = require("../utilities/account-validation"); // ✅ Validation middleware

// GET /account/login → Render login page
router.get("/login", Util.handleErrors(accountController.buildLogin));

// POST /account/login → Handle login form submission
router.post("/login", Util.handleErrors(accountController.postLogin));

// GET /account/register → Deliver Registration View
router.get("/register", Util.handleErrors(accountController.buildRegister));

// POST /account/register → Process Registration Form
router.post(
  "/register",
  regValidate.registrationRules(), // ✅ Apply validation rules
  regValidate.checkRegData, // ✅ Check for validation errors
  Util.handleErrors(accountController.postRegister) // ✅ Corrected function name
);

// Export the router
module.exports = router;
