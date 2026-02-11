// Script para generar hash de password para admin
const bcrypt = require("bcrypt");

async function generateHash() {
  const password = "admin123";
  const hash = await bcrypt.hash(password, 10);
  console.log("\n=== PASSWORD HASH ===");
  console.log("Password:", password);
  console.log("Hash:", hash);
  console.log("\nSQL Query:");
  console.log(
    `UPDATE users SET password = '${hash}' WHERE email = 'admin@gcd.com';`,
  );
}

generateHash().catch(console.error);
