const getConnection = require('../Models/database');


const getAllInfo = async (req, res) => {
    let conn;
    try {
      conn = await getConnection(); 
      const rows = await conn.query('SELECT * FROM techcoach_lite.techcoach_users');
      res.status(200).json(rows); 
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while processing the request' });
    } finally {
      if (conn) {
        conn.release(); 
      }
    }
};


const getInfo = async (req, res) => {
  const { id } = req.params; 
  let conn;

  try {
    conn = await getConnection(); 
    
    const rows = await conn.query('SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  } finally {
    if (conn) {
      conn.release(); 
    }
  }
};


const getUserType = async(req,res) =>{
  const userId = req.user.id;
  try {
    const conn = await getConnection();
    const result = await conn.query('SELECT user_type FROM techcoach_lite.techcoach_users WHERE user_id = ?',[userId]);
    if(result.length === 0) {
      return res.status(404).json({message:'User not found'});
    }
    const isAdmin= result[0].user_type === 'admin';
    return res.json({isAdmin});
  } catch (error) {
    console.error('Error checking user type:',error);
    return res.status(500).json({message:'Internal Server Error'})
  }
}


const getTotalDecisionsCount = async (req, res) => {
  const { id } = req.params; 
  let conn;

  try {
    conn = await getConnection(); 

    const rows = await conn.query(
      'SELECT COUNT(*) AS total_decisions FROM techcoach_lite.techcoach_decision WHERE user_id = ?',
      [id]
    );

    if (!rows || rows.length === 0 || rows[0].total_decisions === undefined) {
      return res.status(404).json({ message: 'No decisions found for this user.' });
    }

    const totalDecisions = Number(rows[0].total_decisions);

    return res.status(200).json({ total_decisions: totalDecisions });
  } catch (error) {
    console.error('Error fetching total decision count:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (conn) conn.release(); 
  }
};


const getLastLoginDate = async (req, res) => {
  const userId = req.params.userId; 

  try {
    const conn = await getConnection()

    const rows = await conn.query('SELECT login_time FROM techcoach_lite.techcoach_login_history WHERE user_id = ? ORDER BY login_time DESC LIMIT 1', [userId]);

    if (rows.length > 0) {
      return res.status(200).json({
        lastLoginDate: rows[0].login_time
      });
    } else {
      return res.status(404).json({ message: "No login history found for this user." });
    }
  } catch (error) {
    console.error('Error fetching last login date:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


const deleteAccount = async (req, res) => {
  const { id } = req.params;  
  let conn;

  try {
    conn = await getConnection(); 
    await conn.beginTransaction();  

    await conn.query('DELETE FROM techcoach_lite.techcoach_decision_swot_linked_info WHERE decision_id IN (SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE user_id = ?)', [id]);
    await conn.query('DELETE FROM techcoach_lite.techcoach_decision_reason WHERE decision_id IN (SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE user_id = ?)', [id]);
    await conn.query('DELETE FROM techcoach_lite.techcoach_decision_tag_linked_info WHERE decision_id IN (SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE user_id = ?)', [id]);
    await conn.query('DELETE FROM techcoach_lite.techcoach_shared_decisions WHERE decisionId IN (SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE user_id = ?)', [id]);
    await conn.query('DELETE FROM techcoach_lite.techcoach_conversations WHERE decisionId IN (SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE user_id = ?)', [id]);

    await conn.query('DELETE FROM techcoach_lite.techcoach_decision_skill_linked_info WHERE decision_id IN (SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE user_id = ?)', [id]);

    await conn.query('DELETE FROM techcoach_lite.techcoach_decision WHERE user_id = ?', [id]);

    await conn.query('DELETE FROM techcoach_lite.techcoach_soft_skill_value WHERE user_id = ?', [id]);

    await conn.query('DELETE FROM techcoach_lite.techcoach_profile_swot_values WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM techcoach_lite.techcoach_personal_info WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM techcoach_lite.techcoach_login_history WHERE user_id = ?', [id]);

    await conn.query('DELETE FROM techcoach_lite.techcoach_group_members WHERE group_id IN (SELECT id FROM techcoach_lite.techcoach_groups WHERE created_by = ?)', [id]);
    await conn.query('DELETE FROM techcoach_lite.techcoach_group_members WHERE member_id = ?', [id]);
    await conn.query('DELETE FROM techcoach_lite.techcoach_groups WHERE created_by = ?', [id]);
    await conn.query('DELETE FROM techcoach_lite.techcoach_users WHERE user_id = ?', [id]);
    await conn.commit(); 
    res.status(200).json({ message: 'Account and associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    if (conn) {
      await conn.rollback();  
    }
    res.status(500).json({ error: 'An error occurred while deleting the account' });
  } finally {
    if (conn) {
      conn.release();  
    }
  }
};


module.exports = { getAllInfo,getInfo, getUserType, getTotalDecisionsCount, getLastLoginDate, deleteAccount }