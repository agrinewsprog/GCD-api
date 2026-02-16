// ============================================
// Script para generar fechas de newsletters
// ============================================
// Ejecutar: node scripts/generate-newsletter-schedules.js [año]
// Ejemplo: node scripts/generate-newsletter-schedules.js 2026

require("dotenv").config();
const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3307"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root123",
  database: process.env.DB_NAME || "gcd_db",
};

console.log(
  `🔌 Connecting to database: ${DB_CONFIG.user}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`,
);

const DAYS_MAP = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Encuentra el día específico de una semana específica de un mes
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @param {number} weekNumber - Número de semana (1-5)
 * @param {string} dayName - Nombre del día (Monday, Tuesday, etc.)
 * @returns {Date} Fecha calculada
 */
function findWeekdayInMonth(year, month, weekNumber, dayName) {
  const targetDayOfWeek = DAYS_MAP[dayName];

  // Empezar desde el día 1 del mes
  let date = new Date(year, month - 1, 1);

  // Encontrar el primer día del mes que coincide con el día objetivo
  while (date.getDay() !== targetDayOfWeek) {
    date.setDate(date.getDate() + 1);
  }

  // Ahora date es el primer día objetivo del mes
  // Agregar (weekNumber - 1) semanas
  date.setDate(date.getDate() + (weekNumber - 1) * 7);

  // Verificar que todavía estamos en el mismo mes
  if (date.getMonth() !== month - 1) {
    // Si nos pasamos, retroceder una semana
    date.setDate(date.getDate() - 7);
  }

  return date;
}

/**
 * Verifica si un mes cumple con la frecuencia bimonthly
 */
function shouldGenerateForBimonthly(month, offset) {
  // offset 0 = meses pares (2,4,6,8,10,12)
  // offset 1 = meses impares (1,3,5,7,9,11)
  if (offset === 0) {
    return month % 2 === 0;
  } else {
    return month % 2 === 1;
  }
}

/**
 * Genera schedules para un tipo de newsletter en un año
 */
async function generateSchedulesForType(connection, type, year) {
  const schedules = [];

  for (let month = 1; month <= 12; month++) {
    // Verificar frecuencia
    if (type.frequency === "bimonthly") {
      if (!shouldGenerateForBimonthly(month, type.frequency_offset)) {
        continue; // Saltar este mes
      }
    } else if (type.frequency === "quarterly") {
      // Quarterly: cada 3 meses
      if ((month - 1) % 3 !== type.frequency_offset) {
        continue;
      }
    }

    // Calcular fecha
    const targetDate = findWeekdayInMonth(
      year,
      month,
      parseInt(type.week_of_month),
      type.day_of_week,
    );

    // Format date as YYYY-MM-DD without timezone conversion
    const yearNum = targetDate.getFullYear();
    const monthNum = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dayNum = String(targetDate.getDate()).padStart(2, "0");
    const dateString = `${yearNum}-${monthNum}-${dayNum}`;

    schedules.push({
      newsletter_type_id: type.id,
      scheduled_date: dateString,
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      is_available: true,
    });
  }

  return schedules;
}

/**
 * Función principal
 */
async function generateNewsletterSchedules(year) {
  let connection;

  try {
    console.log(`\n🗓️  Generando schedules de newsletters para ${year}...\n`);

    connection = await mysql.createConnection(DB_CONFIG);

    // Obtener todos los newsletter types activos
    const [types] = await connection.execute(
      `SELECT nt.*, m.name as medium_name 
       FROM newsletter_types nt
       JOIN mediums m ON nt.medium_id = m.id
       WHERE nt.is_active = TRUE
       ORDER BY m.name, nt.region, nt.name`,
    );

    if (types.length === 0) {
      console.log("⚠️  No hay newsletter types definidos.");
      console.log("   Ejecuta primero: mysql < database/newsletter-seed.sql");
      return;
    }

    console.log(`✅ Encontrados ${types.length} tipos de newsletter\n`);

    let totalSchedules = 0;

    for (const type of types) {
      console.log(`📰 ${type.medium_name} - ${type.region} - ${type.name}`);
      console.log(
        `   ${type.day_of_week} semana ${type.week_of_month} (${type.frequency})`,
      );

      // Generar schedules para este tipo
      const schedules = await generateSchedulesForType(connection, type, year);

      // Insertar en la base de datos (ignorar duplicados)
      if (schedules.length > 0) {
        const values = schedules.map((s) => [
          s.newsletter_type_id,
          s.scheduled_date,
          s.year,
          s.month,
          s.is_available,
        ]);

        try {
          const [result] = await connection.query(
            `INSERT IGNORE INTO newsletter_schedules 
             (newsletter_type_id, scheduled_date, year, month, is_available)
             VALUES ?`,
            [values],
          );

          console.log(`   ✓ ${result.affectedRows} fechas generadas`);
          totalSchedules += result.affectedRows;

          // Mostrar primeras 3 fechas como ejemplo
          const exampleDates = schedules
            .slice(0, 3)
            .map((s) => s.scheduled_date)
            .join(", ");
          console.log(`   📅 Ejemplos: ${exampleDates}...\n`);
        } catch (err) {
          if (err.code === "ER_DUP_ENTRY") {
            console.log(`   ℹ️  Fechas ya existían (omitidas)\n`);
          } else {
            throw err;
          }
        }
      }
    }

    console.log(`\n✅ Proceso completado!`);
    console.log(
      `   Total: ${totalSchedules} schedules generados para ${year}\n`,
    );

    // Mostrar resumen
    const [summary] = await connection.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) as disponibles,
        SUM(CASE WHEN is_available = 0 THEN 1 ELSE 0 END) as asignados
       FROM newsletter_schedules
       WHERE year = ?`,
      [year],
    );

    if (summary[0]) {
      console.log(`📊 Resumen del año ${year}:`);
      console.log(`   Total schedules: ${summary[0].total}`);
      console.log(`   Disponibles: ${summary[0].disponibles}`);
      console.log(`   Asignados: ${summary[0].asignados}\n`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack trace:", error.stack);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.sqlMessage) {
      console.error("SQL Error:", error.sqlMessage);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar
const year = process.argv[2]
  ? parseInt(process.argv[2])
  : new Date().getFullYear();

if (year < 2020 || year > 2100) {
  console.error(
    "❌ Año inválido. Uso: node generate-newsletter-schedules.js [año]",
  );
  process.exit(1);
}

generateNewsletterSchedules(year);
