const getConnection = require('../Models/database');

const isUserSubscribed = async (userId) => {
  const conn = await getConnection();

  const rows = await conn.query(`
    SELECT status FROM user_subscription
    WHERE user_id = ? AND status = 'ACTIVE'
    LIMIT 1
  `, [userId]);

  conn.release();
  return rows.length > 0;
};

module.exports = { isUserSubscribed };
