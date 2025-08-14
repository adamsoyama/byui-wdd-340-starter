const pool = require("../database/");

// Get all classifications
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

// Get inventory items by classification ID
async function getInventoryByClassificationId(classification_id) {
  const data = await pool.query(
    `SELECT * FROM public.inventory AS i
     JOIN public.classification AS c
     ON i.classification_id = c.classification_id
     WHERE i.classification_id = $1`,
    [classification_id]
  );
  return data.rows;
}

// Get a single vehicle by its ID
async function getVehicleById(invId) {
  const data = await pool.query(
    `SELECT * FROM public.inventory AS i
     JOIN public.classification AS c
     ON i.classification_id = c.classification_id
     WHERE i.inv_id = $1`,
    [invId]
  );
  return data.rows[0];
}

// Add a new classification
async function addClassification(classification_name) {
  const sql = "INSERT INTO classification (classification_name) VALUES ($1)";
  return await pool.query(sql, [classification_name]);
}

// Add a new inventory item
async function addInventoryItem(data) {
  const sql = `
    INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING inv_id;
  `;
  const values = [
    data.inv_make,
    data.inv_model,
    data.inv_year,
    data.inv_description,
    data.inv_image,
    data.inv_thumbnail,
    data.inv_price,
    data.inv_miles,
    data.inv_color,
    data.classification_id,
  ];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

// Update an existing vehicle
async function updateInventory(data) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_make = $1,
          inv_model = $2,
          inv_description = $3,
          inv_image = $4,
          inv_thumbnail = $5,
          inv_price = $6,
          inv_year = $7,
          inv_miles = $8,
          inv_color = $9,
          classification_id = $10
      WHERE inv_id = $11
      RETURNING *
    `;
    const values = [
      data.inv_make,
      data.inv_model,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_year,
      data.inv_miles,
      data.inv_color,
      data.classification_id,
      data.inv_id,
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Model error: " + error);
    return null;
  }
}

// Delete a vehicle by ID
async function deleteVehicleById(invId) {
  const sql = "DELETE FROM inventory WHERE inv_id = $1";
  const result = await pool.query(sql, [invId]);
  return result.rowCount > 0;
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventoryItem,
  updateInventory,
  deleteVehicleById,
};
