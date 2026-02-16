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

    // Verificar campañas
    const [campaigns] = await conn.query(
      "SELECT id, name FROM campaigns LIMIT 10",
    );
    console.log("Campañas disponibles:", campaigns.length);
    campaigns.forEach((c) => console.log(`  - ID: ${c.id}, Nombre: ${c.name}`));

    console.log("\n");

    // Verificar medios y canales
    const [mediums] = await conn.query("SELECT id, name FROM mediums LIMIT 5");
    console.log("Medios disponibles:", mediums.length);
    if (mediums.length > 0)
      console.log(`  - Primer medio: ID ${mediums[0].id}, ${mediums[0].name}`);

    const [channels] = await conn.query(
      "SELECT id, name FROM channels LIMIT 5",
    );
    console.log("Canales disponibles:", channels.length);
    if (channels.length > 0)
      console.log(
        `  - Primer canal: ID ${channels[0].id}, ${channels[0].name}`,
      );

    console.log("\n");

    // Verificar acciones actuales
    const [currentActions] = await conn.query(`
      SELECT ca.id, c.name as campaign, a.name as action, ca.start_date, ca.workflow_state
      FROM campaign_actions ca
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN actions a ON ca.action_id = a.id
      WHERE a.id IN (34, 38)
      ORDER BY ca.start_date DESC
      LIMIT 5
    `);

    console.log("Acciones de workflow existentes:", currentActions.length);
    currentActions.forEach((a) =>
      console.log(
        `  - ${a.action}: ${a.campaign} (${a.start_date}) - ${a.workflow_state}`,
      ),
    );

    if (currentActions.length === 0) {
      console.log(
        "\n⚠️  No hay acciones de workflow. Creando tareas de prueba...\n",
      );

      // Insertar tareas de prueba
      if (campaigns.length > 0 && mediums.length > 0 && channels.length > 0) {
        const campaignId = campaigns[0].id;
        const mediumId = mediums[0].id;
        const channelId = channels[0].id;

        // Newsletter
        await conn.query(
          `
          INSERT INTO campaign_actions 
          (campaign_id, medium_id, channel_id, action_id, quantity, start_date, end_date, workflow_state, design_responsible, deadline_date, notes)
          VALUES 
          (?, ?, ?, 38, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'por_enviar', 'propio', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Newsletter de prueba')
        `,
          [campaignId, mediumId, channelId],
        );
        console.log("✓ Tarea Newsletter creada");

        // RRSS
        await conn.query(
          `
          INSERT INTO campaign_actions 
          (campaign_id, medium_id, channel_id, action_id, quantity, start_date, end_date, workflow_state, design_responsible, deadline_date, notes)
          VALUES 
          (?, ?, ?, 34, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'en_edicion', 'cliente', DATE_ADD(CURDATE(), INTERVAL 8 DAY), 'Post RRSS de prueba')
        `,
          [campaignId, mediumId, channelId],
        );
        console.log("✓ Tarea RRSS creada");

        // Otra para cambios
        await conn.query(
          `
          INSERT INTO campaign_actions 
          (campaign_id, medium_id, channel_id, action_id, quantity, start_date, end_date, workflow_state, design_responsible, deadline_date, notes)
          VALUES 
          (?, ?, ?, 38, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'cambios', 'propio', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Newsletter con cambios')
        `,
          [campaignId, mediumId, channelId],
        );
        console.log("✓ Tarea en cambios creada");
      }
    }

    await conn.end();
    console.log("\n✓ Conexión cerrada");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
