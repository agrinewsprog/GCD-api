const mysql = require("mysql2/promise");

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      port: 3307,
      user: "root",
      password: "root123",
      database: "gcd_db",
    });

    console.log("✓ Conectado a la base de datos\n");

    // Obtener datos necesarios
    const [campaigns] = await conn.query(
      "SELECT id, name FROM campaigns LIMIT 1",
    );
    const [mediums] = await conn.query("SELECT id FROM mediums LIMIT 1");
    const [channels] = await conn.query("SELECT id FROM channels LIMIT 1");

    if (
      campaigns.length === 0 ||
      mediums.length === 0 ||
      channels.length === 0
    ) {
      console.log("❌ No hay datos suficientes para crear acciones");
      await conn.end();
      return;
    }

    const campaignId = campaigns[0].id;
    const mediumId = mediums[0].id;
    const channelId = channels[0].id;

    console.log(`Creando tareas para campaña: ${campaigns[0].name}\n`);

    // Tareas para febrero 2026
    const tasks = [
      {
        date: "2026-02-14",
        action: 38,
        state: "por_enviar",
        type: "Newsletter día 14",
      },
      {
        date: "2026-02-15",
        action: 34,
        state: "en_edicion",
        type: "Post RRSS día 15",
      },
      {
        date: "2026-02-16",
        action: 38,
        state: "cambios",
        type: "Newsletter día 16",
      },
      {
        date: "2026-02-18",
        action: 34,
        state: "por_enviar",
        type: "Post RRSS día 18",
      },
      {
        date: "2026-02-20",
        action: 38,
        state: "en_edicion",
        type: "Newsletter día 20",
      },
      {
        date: "2026-02-22",
        action: 34,
        state: "cambios",
        type: "Post RRSS día 22",
      },
      {
        date: "2026-02-25",
        action: 38,
        state: "por_enviar",
        type: "Newsletter día 25",
      },
    ];

    for (const task of tasks) {
      await conn.query(
        `
        INSERT INTO campaign_actions 
        (campaign_id, medium_id, channel_id, action_id, quantity, start_date, end_date, workflow_state, design_responsible, deadline_date, notes)
        VALUES 
        (?, ?, ?, ?, 1, ?, DATE_ADD(?, INTERVAL 7 DAY), ?, 'propio', DATE_ADD(?, INTERVAL 3 DAY), ?)
      `,
        [
          campaignId,
          mediumId,
          channelId,
          task.action,
          task.date,
          task.date,
          task.state,
          task.date,
          task.type,
        ],
      );
      console.log(`✓ Creada: ${task.type} (${task.state})`);
    }

    console.log("\n✅ Todas las tareas fueron creadas exitosamente");
    await conn.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
