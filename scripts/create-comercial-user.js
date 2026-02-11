// Script para crear usuario comercial
// Ejecutar: node create-comercial-user.js

const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function createComercialUser() {
  const connection = await mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root123",
    database: "gcd_db",
  });

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("comercial123", 10);

    // Insert user
    const [userResult] = await connection.execute(
      "INSERT INTO users (name, surname, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      ["Carlos", "Comercial", "comercial@gcd.com", hashedPassword],
    );

    const userId = userResult.insertId;
    console.log("✅ Usuario creado con ID:", userId);

    // Get comercial role ID
    const [roles] = await connection.execute(
      "SELECT id FROM roles WHERE name = ?",
      ["comercial"],
    );

    if (roles.length === 0) {
      console.error('❌ No se encontró el rol "comercial"');
      await connection.end();
      return;
    }

    const roleId = roles[0].id;

    // Assign role to user
    await connection.execute(
      "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
      [userId, roleId],
    );

    console.log("✅ Rol comercial asignado");
    console.log("\n📧 Credenciales:");
    console.log("   Email: comercial@gcd.com");
    console.log("   Password: comercial123");
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      console.log("ℹ️  El usuario ya existe");
    } else {
      console.error("❌ Error:", error.message);
    }
  } finally {
    await connection.end();
  }
}

createComercialUser();
