const mysql = require("mysql2/promise");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root123",
  database: "gcd_db",
  port: 3307,
};

async function checkEnum() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.query(`
      SELECT COLUMN_TYPE 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA='gcd_db' 
        AND TABLE_NAME='campaign_actions' 
        AND COLUMN_NAME='workflow_state'
    `);

    console.log("Definición ENUM workflow_state:");
    console.log(rows[0].COLUMN_TYPE);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkEnum();
