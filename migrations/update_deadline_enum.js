const mysql = require("mysql2/promise");

async function updateDatabase() {
  const conn = await mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root123",
    database: "gcd_db",
    multipleStatements: true,
  });

  try {
    // Primero, ver qué valores existen
    console.log("Revisando valores actuales...");
    const [rows] = await conn.query(`
      SELECT DISTINCT deadline_type, COUNT(*) as count
      FROM magazine_deadline_confirmations
      GROUP BY deadline_type
    `);
    console.log("Valores actuales:", rows);

    // Paso 1: Ampliar el ENUM para incluir los nuevos valores
    console.log("\nAmpliando ENUM para incluir nuevos valores...");
    await conn.query(`
      ALTER TABLE magazine_deadline_confirmations 
      MODIFY COLUMN deadline_type ENUM(
        'client', 
        'send_to_edition', 
        'edition', 
        'changes',
        'changes_commercial', 
        'changes_post_sale',
        'book_assembly'
      ) NOT NULL
    `);
    console.log("✓ ENUM ampliado");

    // Paso 2: Actualizar datos antiguos
    console.log("\nActualizando cambios a changes_commercial...");
    const [result2] = await conn.query(`
      UPDATE magazine_deadline_confirmations
      SET deadline_type = 'changes_commercial'
      WHERE deadline_type = 'changes'
    `);
    console.log(`✓ ${result2.affectedRows} registros actualizados`);

    // Paso 3: Eliminar registros con book_assembly (ya no se usará)
    console.log("\nEliminando confirmaciones de book_assembly...");
    const [result] = await conn.query(`
      DELETE FROM magazine_deadline_confirmations
      WHERE deadline_type = 'book_assembly'
    `);
    console.log(`✓ ${result.affectedRows} registros eliminados`);

    // Paso 4: Reducir el ENUM a solo los valores que queremos
    console.log("\nActualizando ENUM a valores finales...");
    await conn.query(`
      ALTER TABLE magazine_deadline_confirmations 
      MODIFY COLUMN deadline_type ENUM(
        'client', 
        'send_to_edition', 
        'edition', 
        'changes_commercial', 
        'changes_post_sale'
      ) NOT NULL
    `);
    console.log("✓ ENUM actualizado a valores finales");

    // Añadir campos a magazine_editions
    console.log("\nAñadiendo campos a magazine_editions...");

    // Verificar si las columnas ya existen
    const [columns] = await conn.query(`
      SHOW COLUMNS FROM magazine_editions LIKE 'publication_link'
    `);

    if (columns.length === 0) {
      await conn.query(`
        ALTER TABLE magazine_editions
        ADD COLUMN publication_link VARCHAR(500) NULL AFTER status
      `);
      console.log("✓ Campo publication_link añadido");
    } else {
      console.log("○ Campo publication_link ya existe");
    }

    const [columns2] = await conn.query(`
      SHOW COLUMNS FROM magazine_editions LIKE 'is_completed'
    `);

    if (columns2.length === 0) {
      await conn.query(`
        ALTER TABLE magazine_editions
        ADD COLUMN is_completed BOOLEAN DEFAULT FALSE AFTER publication_link
      `);
      console.log("✓ Campo is_completed añadido");
    } else {
      console.log("○ Campo is_completed ya existe");
    }

    console.log("\n✓ Migración completada exitosamente");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await conn.end();
  }
}

updateDatabase();
