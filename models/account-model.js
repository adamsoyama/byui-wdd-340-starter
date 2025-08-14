const pool = require("../database/");

/**
 * Normalize email for consistency
 */
function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

/**
 * Find an account by email
 * Used for login and password comparison
 */
async function findAccountByEmail(account_email) {
  try {
    const normalizedEmail = normalizeEmail(account_email);
    const sql = `
      SELECT 
        account_id, 
        account_firstname, 
        account_lastname, 
        account_email, 
        account_type, 
        account_password 
      FROM account 
      WHERE account_email = $1
    `;
    const result = await pool.query(sql, [normalizedEmail]);
    return result.rows[0]; // Returns full record for login validation
  } catch (error) {
    throw new Error("Database error: " + error.message);
  }
}

/**
 * Register a new account
 */
async function registerAccount({
  account_firstname,
  account_lastname,
  account_email,
  account_password,
}) {
  try {
    const normalizedEmail = normalizeEmail(account_email);

    const sql = `
      INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
      ) VALUES ($1, $2, $3, $4, 'Client') RETURNING 
        account_id,
        account_firstname,
        account_email,
        account_type
    `;

    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      normalizedEmail,
      account_password,
    ]);

    return result.rows[0]; // Only returns necessary fields
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("Email already exists.");
    }
    throw new Error("Database error: " + error.message);
  }
}

/**
 * Get account by ID (useful for session validation or profile views)
 */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_email, account_type FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error("Database error: " + error.message);
  }
}

module.exports = {
  findAccountByEmail,
  registerAccount,
  getAccountById,
};
