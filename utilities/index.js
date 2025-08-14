const invModel = require("../models/inventory-model");

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res) {
  const data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function (data) {
  if (!Array.isArray(data) || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  let grid = '<ul id="inv-display">';
  data.forEach((vehicle) => {
    grid += `
      <li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${
      vehicle.inv_make
    } ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${
      vehicle.inv_make
    } ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}" title="View ${
      vehicle.inv_make
    } ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(
            vehicle.inv_price
          )}</span>
        </div>
      </li>
    `;
  });
  grid += "</ul>";
  return grid;
};

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* **************************************
 * Build the vehicle detail view HTML
 ************************************** */
Util.buildVehicleDetailHTML = function (vehicle) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price);

  const mileage = new Intl.NumberFormat("en-US").format(vehicle.inv_miles);

  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image" />
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${mileage} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Transmission:</strong> ${vehicle.inv_transmission}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Body Style:</strong> ${vehicle.classification_name}</p>
      </div>
    </div>
  `;
};

/* **************************************
 * Build the login form HTML
 ************************************** */
Util.buildLoginForm = function () {
  return `
    <form action="/account/login" method="POST" class="login-form">
      <label for="account_email">Email:</label>
      <input type="email" id="account_email" name="account_email" required />

      <label for="account_password">Password:</label>
      <input type="password" id="account_password" name="account_password" required />

      <button type="submit">Login</button>
    </form>

    <p class="signup-link">
      Don't have an account? <a href="/account/register">Register</a>
    </p>
  `;
};

/* **************************************
 * Build the registration form HTML
 ************************************** */
Util.buildRegisterForm = function (formData = {}) {
  return `
    <form action="/account/register" method="POST" class="login-form">
      <label for="account_firstname">First Name</label>
      <input type="text" name="account_firstname" value="${
        formData.account_firstname || ""
      }" required />

      <label for="account_lastname">Last Name</label>
      <input type="text" id="account_lastname" name="account_lastname" value="${
        formData.account_lastname || ""
      }" required />

      <label for="account_email">Email Address</label>
      <input type="email" id="account_email" name="account_email" value="${
        formData.account_email || ""
      }" required />

      <label for="account_password">Password</label>
      <div class="password-wrapper">
        <input
          type="password"
          id="account_password"
          name="account_password"
          value="${formData.account_password || ""}"
          required
          minlength="12"
          title="Password must be at least 12 characters, include one uppercase letter, one number, and one special character."
        />
        <span class="toggle-password" role="button" aria-label="Toggle password visibility">👁️</span>
      </div>

      <button type="submit">Register</button>
    </form>

    <div class="signup-link">
      Already have an account? <a href="/account/login">Login</a>
    </div>
  `;
};

/* **************************************
 * Build the Add Vehicle Form HTML
 ************************************** */
Util.buildAddVehicleForm = function (
  formData = {},
  classifications = [],
  errors = []
) {
  let errorHTML = "";
  if (errors.length > 0) {
    errorHTML += `<div class="flash-message error" role="alert"><ul>`;
    errors.forEach((err) => {
      errorHTML += `<li>${err.msg}</li>`;
    });
    errorHTML += `</ul></div>`;
  }

  let classificationOptions = '<option value="">-- Select --</option>';
  classifications.forEach((c) => {
    const selected =
      formData.classification_id == c.classification_id ? "selected" : "";
    classificationOptions += `<option value="${c.classification_id}" ${selected}>${c.classification_name}</option>`;
  });

  return `
    ${errorHTML}
    <form action="/inv/add-vehicle" method="POST" class="form-wrapper">
      <label for="classification_id">Classification:</label>
      <select name="classification_id" id="classification_id" required>
        ${classificationOptions}
      </select>

      <label for="inv_make">Make:</label>
      <input type="text" id="inv_make" name="inv_make" value="${
        formData.inv_make || ""
      }" required />

      <label for="inv_model">Model:</label>
      <input type="text" id="inv_model" name="inv_model" value="${
        formData.inv_model || ""
      }" required />

      <label for="inv_year">Year:</label>
      <input type="number" id="inv_year" name="inv_year" value="${
        formData.inv_year || ""
      }" required />

      <label for="inv_price">Price:</label>
      <input type="number" step="0.01" id="inv_price" name="inv_price" value="${
        formData.inv_price || ""
      }" required />

      <label for="inv_miles">Miles:</label>
      <input type="number" id="inv_miles" name="inv_miles" value="${
        formData.inv_miles || ""
      }" />

      <label for="inv_color">Color:</label>
      <input type="text" id="inv_color" name="inv_color" value="${
        formData.inv_color || ""
      }" />

      <label for="inv_description">Description:</label>
      <textarea id="inv_description" name="inv_description" required>${
        formData.inv_description || ""
      }</textarea>

      <label for="inv_image">Image Path:</label>
      <input type="text" id="inv_image" name="inv_image" value="${
        formData.inv_image || ""
      }" required />

      <label for="inv_thumbnail">Thumbnail Path:</label>
      <input type="text" id="inv_thumbnail" name="inv_thumbnail" value="${
        formData.inv_thumbnail || ""
      }" required />

      <label for="inv_transmission">Transmission:</label>
      <input type="text" id="inv_transmission" name="inv_transmission" value="${
        formData.inv_transmission || ""
      }" />

      <button type="submit">Add Vehicle</button>
    </form>
  `;
};

/* ****************************************
 *  Authorization Middleware: Check Login
 * **************************************** */
Util.checkLogin = (req, res, next) => {
  if (req.session?.account) {
    return next();
  }

  req.flash("errorMessage", "Please log in to access this page.");
  return res.redirect("/account/login");
};

/* **************************************
 * Build the classification <select> list
 ************************************** */
Util.buildClassificationList = async function (selectedId = "") {
  const data = await invModel.getClassifications();
  let list = `<select id="classification_id" name="classification_id" required>`;
  list += `<option value="">Select a classification</option>`;
  data.rows.forEach((row) => {
    const selected = row.classification_id == selectedId ? "selected" : "";
    list += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`;
  });
  list += `</select>`;
  return list;
};

module.exports = Util;
