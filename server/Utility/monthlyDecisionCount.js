const getConnection = require('../Models/database');

const getMonthlyDecisionCount = async (userId) => {
  const conn = await getConnection();

  const result = await conn.query(`
    SELECT COUNT(*) AS count
    FROM techcoach_lite.techcoach_decision
    WHERE user_id = ?
    AND MONTH(creation_date) = MONTH(CURRENT_DATE())
    AND YEAR(creation_date) = YEAR(CURRENT_DATE())
  `, [userId]);

  conn.release();
  return result[0].count;
};

module.exports = { getMonthlyDecisionCount };
