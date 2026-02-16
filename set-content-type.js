/**
 * Script para establecer content_type='articulo_tecnico' en algunas tareas de newsletter
 */

const mysql = require("mysql2/promise");

// Configuración de la base de datos
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root123",
  database: "gcd_db",
  port: 3307,
};

async function setContentType() {
  let connection;

  try {
    console.log("Conectando a la base de datos...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✓ Conectado\n");

    // Obtener todas las tareas de newsletter
    console.log("Obteniendo tareas de newsletter (action_id = 38)...");
    const [tasks] = await connection.query(`
      SELECT 
        ca.id,
        ca.content_type,
        ca.workflow_state,
        a.name as action_name,
        c.name as campaign_name
      FROM campaign_actions ca
      JOIN actions a ON ca.action_id = a.id
      JOIN campaigns c ON ca.campaign_id = c.id
      WHERE ca.action_id = 38
      ORDER BY ca.id ASC
    `);

    console.log(`✓ Encontradas ${tasks.length} tareas de newsletter\n`);

    if (tasks.length === 0) {
      console.log("No hay tareas de newsletter para actualizar.");
      return;
    }

    console.log('Actualizando content_type a "articulo_tecnico"...\n');
    let updated = 0;

    for (const task of tasks) {
      if (task.content_type !== "articulo_tecnico") {
        await connection.query(
          "UPDATE campaign_actions SET content_type = ? WHERE id = ?",
          ["articulo_tecnico", task.id],
        );

        console.log(`✓ Tarea #${task.id} - ${task.campaign_name}`);
        console.log(`  Tipo anterior: ${task.content_type || "NULL"}`);
        console.log(`  Tipo nuevo: articulo_tecnico\n`);
        updated++;
      } else {
        console.log(`⊘ Tarea #${task.id} - Ya es artículo técnico`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("RESUMEN:");
    console.log(`Total tareas: ${tasks.length}`);
    console.log(`Actualizadas: ${updated}`);
    console.log(`Sin cambios: ${tasks.length - updated}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ Conexión cerrada");
    }
  }
}

// Ejecutar el script
setContentType()
  .then(() => {
    console.log("\n✓ Script completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error ejecutando script:", error);
    process.exit(1);
  });
