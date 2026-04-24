const getConnection = require('./Models/database');

const runUpdate = async () => {
  let conn;

  try {
    conn = await getConnection();

    console.log("Running bulk update...");

    const result = await conn.query(`
      UPDATE techcoach_lite.techcoach_decision
      SET 
        decision_name = COALESCE(decision_name_new_enc, decision_name),
        user_statement = COALESCE(user_statement_new_enc, user_statement)
      WHERE 
        decision_name_new_enc IS NOT NULL
        OR user_statement_new_enc IS NOT NULL
    `);

    console.log("✅ Rows updated:", result.affectedRows);

  } catch (error) {
    console.error("❌ Update script error:", error);
  } finally {
    if (conn) conn.release();
  }
};

runUpdate();