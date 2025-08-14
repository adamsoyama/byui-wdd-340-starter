"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const classificationSelect = document.querySelector("#classification_id");

  if (!classificationSelect) {
    console.error("Select element with ID 'classification_id' not found.");
    return;
  }

  classificationSelect.addEventListener("change", async () => {
    const classificationId = classificationSelect.value;
    console.log(`Selected classification ID: ${classificationId}`);

    try {
      const inventoryData = await fetchInventoryByClassification(
        classificationId
      );
      renderInventoryTable(inventoryData);
    } catch (error) {
      console.error("Error fetching inventory:", error.message);
    }
  });
});

/**
 * Fetch inventory data based on classification ID
 * @param {string} classificationId
 * @returns {Promise<Array>} Inventory items
 */
async function fetchInventoryByClassification(classificationId) {
  const response = await fetch(`/inv/getInventory/${classificationId}`);

  if (!response.ok) {
    throw new Error(`Network response was not OK: ${response.status}`);
  }

  return await response.json();
}

/**
 * Render inventory data into the table
 * @param {Array} inventory
 */
function renderInventoryTable(inventory) {
  const table = document.querySelector("#inventoryDisplay");

  if (!table) {
    console.error("Table element with ID 'inventoryDisplay' not found.");
    return;
  }

  table.innerHTML = "";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Make</th>
      <th>Model</th>
      <th>Year</th>
      <th>Price</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  inventory.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.inv_make}</td>
      <td>${item.inv_model}</td>
      <td>${item.inv_year}</td>
      <td>$${item.inv_price.toLocaleString()}</td>
      <td>
        <a href="/inv/edit/${item.inv_id}">Edit</a> |
        <a href="/inv/delete/${item.inv_id}">Delete</a>
      </td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
}

/**
 * Build inventory items into HTML table components and inject into DOM
 * @param {Array} data - Array of inventory objects
 */
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");

  if (!inventoryDisplay) {
    console.error("Element with ID 'inventoryDisplay' not found.");
    return;
  }

  // Clear previous content
  inventoryDisplay.innerHTML = "";

  // Create table head
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Vehicle Name</th>
      <th></th>
      <th></th>
    </tr>
  `;
  inventoryDisplay.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");

  data.forEach((vehicle) => {
    console.log(`${vehicle.inv_id}, ${vehicle.inv_model}`);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${vehicle.inv_make} ${vehicle.inv_model}</td>
      <td>
        <a href="/inv/edit/${vehicle.inv_id}" title="Click to update">Modify</a>
      </td>
      <td>
        <a href="/inv/delete/${vehicle.inv_id}" title="Click to delete">Delete</a>
      </td>
    `;

    tbody.appendChild(row);
  });

  inventoryDisplay.appendChild(tbody);
}
