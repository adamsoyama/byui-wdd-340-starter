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
    return result.rows[0];
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

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("Email already exists.");
    }
    throw new Error("Database error: " + error.message);
  }
}

/**
 * Get account by ID
 */
async function getAccountById(accountId) {
  const sql = "SELECT * FROM account WHERE account_id = $1";
  const result = await pool.query(sql, [accountId]);
  return result.rows[0];
}

/**
 * Update account details
 */
async function updateAccountDetails(accountId, { firstname, lastname, email }) {
  const normalizedEmail = normalizeEmail(email);
  const sql = `
    UPDATE account
    SET account_firstname = $1,
        account_lastname = $2,
        account_email = $3
    WHERE account_id = $4
  `;
  await pool.query(sql, [firstname, lastname, normalizedEmail, accountId]);
}

/**
 * Update account password
 */
async function updateAccountPassword(accountId, hashedPassword) {
  const sql = `
    UPDATE account
    SET account_password = $1
    WHERE account_id = $2
  `;
  await pool.query(sql, [hashedPassword, accountId]);
}

module.exports = {
  findAccountByEmail,
  registerAccount,
  getAccountById,
  updateAccountDetails,
  updateAccountPassword,
};
