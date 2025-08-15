const jwt = require("jsonwebtoken");

/**
 * Middleware to restrict access to inventory management routes
 * Only allows users with 'Employee' or 'Admin' roles
 */
function checkInventoryAccess(req, res, next) {
  const tokenName = process.env.TOKEN_COOKIE_NAME || "jwt";
  const token = req.cookies[tokenName];

  // No token found
  if (!token) {
    req.flash(
      "errorMessage",
      "You must be logged in to access inventory management."
    );
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const allowedRoles = ["Employee", "Admin"];
    if (!allowedRoles.includes(decoded.account_type)) {
      req.flash(
        "errorMessage",
        "You do not have permission to access this area."
      );
      return res.redirect("/account/login");
    }

    // Attach decoded account to request for downstream use
    req.account = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed in inventory access:", err.message);
    req.flash("errorMessage", "Invalid session. Please log in again.");
    return res.redirect("/account/login");
  }
}

module.exports = checkInventoryAccess;
