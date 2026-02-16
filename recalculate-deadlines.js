/**
 * Script para recalcular deadlines automáticos de todas las tareas de workflow
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

/**
 * Obtiene el día de la semana anterior más cercano
 */
function getPreviousWeekday(date, targetDay, weeksBack) {
  const result = new Date(date);

  // Retroceder las semanas especificadas
  result.setDate(result.getDate() - weeksBack * 7);

  // Ajustar al día de la semana objetivo
  const currentDay = result.getDay();
  const daysToSubtract = (currentDay - targetDay + 7) % 7;

  if (daysToSubtract > 0) {
    result.setDate(result.getDate() - daysToSubtract);
  }

  return result;
}

/**
 * Formatea una fecha a formato YYYY-MM-DD
 */
function formatDateToSQL(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calcula deadlines para RRSS (Social Media Post)
 */
function calculateRRSSDeadlines(pubDate) {
  return {
    enviar_cliente: formatDateToSQL(getPreviousWeekday(pubDate, 5, 2)), // Viernes 2 semanas antes
    envio_diseno: formatDateToSQL(getPreviousWeekday(pubDate, 1, 1)), // Lunes 1 semana antes
    edicion: formatDateToSQL(getPreviousWeekday(pubDate, 3, 1)), // Miércoles 1 semana antes
    cambios: formatDateToSQL(getPreviousWeekday(pubDate, 5, 0)), // Viernes misma semana
  };
}

/**
 * Obtiene el deadline específico según el estado del workflow
 */
function getDeadlineForState(publicationDate, workflowState, contentType) {
  const pubDate = new Date(publicationDate);

  // Validar fecha
  if (isNaN(pubDate.getTime())) {
    return null;
  }

  // Calcular deadlines según tipo
  let deadlines;
  if (contentType === "articulo_tecnico") {
    deadlines = {
      enviar_cliente: formatDateToSQL(getPreviousWeekday(pubDate, 5, 3)),
      envio_diseno: formatDateToSQL(getPreviousWeekday(pubDate, 1, 2)),
      edicion: formatDateToSQL(getPreviousWeekday(pubDate, 4, 2)),
      cambios: formatDateToSQL(getPreviousWeekday(pubDate, 4, 1)),
    };
  } else {
    deadlines = calculateRRSSDeadlines(pubDate);
  }

  // Mapear estados a deadlines
  const stateDeadlineMap = {
    por_enviar: "enviar_cliente",
    enviado_diseno: "envio_diseno",
    en_edicion: "edicion",
    cambios: "cambios",
  };

  const deadlineKey = stateDeadlineMap[workflowState];
  return deadlineKey ? deadlines[deadlineKey] || null : null;
}

async function recalculateDeadlines() {
  let connection;

  try {
    console.log("Conectando a la base de datos...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✓ Conectado\n");

    // Obtener todas las tareas de newsletter técnico
    console.log("Obteniendo tareas de newsletter y RRSS...");
    const [tasks] = await connection.query(`
      SELECT 
        ca.id,
        ca.start_date,
        ca.content_type,
        ca.workflow_state,
        ca.deadline_date as current_deadline,
        a.name as action_name,
        c.name as campaign_name
      FROM campaign_actions ca
      JOIN actions a ON ca.action_id = a.id
      JOIN campaigns c ON ca.campaign_id = c.id
      WHERE ca.action_id IN (34, 38)
        AND ca.start_date IS NOT NULL
      ORDER BY ca.start_date ASC
    `);

    console.log(`✓ Encontradas ${tasks.length} tareas\n`);

    if (tasks.length === 0) {
      console.log("No hay tareas para actualizar.");
      return;
    }

    console.log("Recalculando deadlines...\n");
    let updated = 0;
    let skipped = 0;

    for (const task of tasks) {
      const newDeadline = getDeadlineForState(
        task.start_date,
        task.workflow_state,
        task.content_type,
      );

      if (newDeadline) {
        await connection.query(
          "UPDATE campaign_actions SET deadline_date = ? WHERE id = ?",
          [newDeadline, task.id],
        );

        const pubDate = new Date(task.start_date).toLocaleDateString("es-ES");
        console.log(`✓ Tarea #${task.id} - ${task.campaign_name}`);
        console.log(`  Estado: ${task.workflow_state}`);
        console.log(`  Publicación: ${pubDate}`);
        console.log(
          `  Deadline anterior: ${task.current_deadline || "Sin deadline"}`,
        );
        console.log(`  Deadline nuevo: ${newDeadline}\n`);
        updated++;
      } else {
        console.log(
          `⊘ Tarea #${task.id} - Estado sin deadline definido (${task.workflow_state})`,
        );
        skipped++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("RESUMEN:");
    console.log(`Total tareas: ${tasks.length}`);
    console.log(`Actualizadas: ${updated}`);
    console.log(`Omitidas: ${skipped}`);
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
recalculateDeadlines()
  .then(() => {
    console.log("\n✓ Script completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error ejecutando script:", error);
    process.exit(1);
  });
