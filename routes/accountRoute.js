// Required Modules
const express = require("express");
const router = express.Router();

// Controllers and Middleware
const accountController = require("../controllers/accountController");
const Util = require("../utilities"); // Utility functions (e.g., error handler, login check)
const regValidate = require("../utilities/account-validation"); // Validation middleware

// ─────────────────────────────────────────────────────────────
// GET Routes
// ─────────────────────────────────────────────────────────────

// Render login page
router.get("/login", Util.handleErrors(accountController.buildLogin));

// Render registration page
router.get("/register", Util.handleErrors(accountController.buildRegister));

// Render account management dashboard (protected)
router.get(
  "/",
  Util.checkLogin,
  Util.handleErrors(accountController.buildAccountManagement)
);

// Render update account view (protected)
router.get(
  "/update-account/:accountId",
  Util.checkLogin,
  Util.handleErrors(accountController.buildUpdateAccountView)
);

// ─────────────────────────────────────────────────────────────
// POST Routes
// ─────────────────────────────────────────────────────────────

// Process login form
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  Util.handleErrors(accountController.postLogin)
);

// Process registration form
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  Util.handleErrors(accountController.postRegister)
);

// Handle account info update (protected)
router.post(
  "/update-account",
  Util.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  Util.handleErrors(accountController.postUpdateAccount)
);

// Handle password change (protected)
router.post(
  "/change-password",
  Util.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  Util.handleErrors(accountController.postChangePassword)
);

// ─────────────────────────────────────────────────────────────
// GET Logout Route
// ─────────────────────────────────────────────────────────────

// Log out and clear session/cookie
router.get("/logout", Util.handleErrors(accountController.logout));

// ─────────────────────────────────────────────────────────────
// Export Router
// ─────────────────────────────────────────────────────────────

module.exports = router;
