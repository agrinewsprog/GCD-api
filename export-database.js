const mysql = require("mysql2/promise");
const fs = require("fs");

async function exportDatabase() {
  const connection = await mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root123",
    database: "gcd_db",
  });

  try {
    console.log("📦 Iniciando exportación de base de datos...");

    // Obtener todas las tablas
    const [tables] = await connection.query("SHOW TABLES");
    const tableNames = tables.map((row) => Object.values(row)[0]);

    let sqlDump = "-- GCD Database Export\n";
    sqlDump += `-- Date: ${new Date().toISOString()}\n`;
    sqlDump += "-- Database: gcd_db\n\n";
    sqlDump += "SET FOREIGN_KEY_CHECKS=0;\n\n";

    for (const tableName of tableNames) {
      console.log(`  ⏳ Exportando tabla: ${tableName}`);

      // Obtener estructura de la tabla
      const [createTable] = await connection.query(
        `SHOW CREATE TABLE \`${tableName}\``,
      );
      sqlDump += `-- Table: ${tableName}\n`;
      sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlDump += createTable[0]["Create Table"] + ";\n\n";

      // Obtener datos
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);

      if (rows.length > 0) {
        sqlDump += `-- Data for table ${tableName}\n`;

        for (const row of rows) {
          const columns = Object.keys(row);
          const values = columns
            .map((col) => {
              const val = row[col];
              if (val === null) return "NULL";
              if (typeof val === "number") return val;
              if (val instanceof Date)
                return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
              return `'${String(val).replace(/'/g, "''")}'`;
            })
            .join(", ");

          sqlDump += `INSERT INTO \`${tableName}\` (\`${columns.join("`, `")}\`) VALUES (${values});\n`;
        }
        sqlDump += "\n";
      }
    }

    sqlDump += "SET FOREIGN_KEY_CHECKS=1;\n";

    // Guardar archivo
    fs.writeFileSync("gcd_backup.sql", sqlDump, "utf8");

    console.log("✅ Base de datos exportada exitosamente a: gcd_backup.sql");
    console.log(
      `📊 Tamaño del archivo: ${(fs.statSync("gcd_backup.sql").size / 1024 / 1024).toFixed(2)} MB`,
    );
  } catch (error) {
    console.error("❌ Error durante la exportación:", error.message);
  } finally {
    await connection.end();
  }
}

exportDatabase();
