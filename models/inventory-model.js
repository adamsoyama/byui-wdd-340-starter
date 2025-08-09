const pool = require("../database/");

async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

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

async function addClassification(classification_name) {
  const sql = "INSERT INTO classification (classification_name) VALUES ($1)";
  return await pool.query(sql, [classification_name]);
}

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

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventoryItem,
};
