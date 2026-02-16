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

    console.log("✓ Conectado\n");

    // Verificar las acciones (actions) disponibles
    const [actions] = await conn.query(
      "SELECT id, name FROM actions WHERE id IN (34, 38)",
    );
    console.log("Acciones configuradas:");
    actions.forEach((a) => console.log(`  - ID ${a.id}: ${a.name}`));

    console.log("\n");

    // Verificar tareas de workflow creadas
    const [tasks] = await conn.query(`
      SELECT 
        ca.id,
        ca.start_date,
        ca.workflow_state,
        ca.deadline_date,
        a.name as action_name,
        c.name as campaign_name
      FROM campaign_actions ca
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN actions a ON ca.action_id = a.id
      WHERE a.id IN (34, 38)
      AND YEAR(ca.start_date) = 2026
      AND MONTH(ca.start_date) = 2
      ORDER BY ca.start_date
    `);

    console.log(`Tareas de workflow para FEBRERO 2026: ${tasks.length}`);
    console.log("─".repeat(80));
    tasks.forEach((t) => {
      console.log(
        `${t.start_date.toISOString().split("T")[0]} | ${t.action_name.padEnd(35)} | ${t.workflow_state.padEnd(12)} | ${t.campaign_name}`,
      );
    });

    await conn.end();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
})();
