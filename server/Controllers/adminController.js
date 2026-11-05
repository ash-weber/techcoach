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


/* const deleteAccount = async (req, res) => {
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
}; */

const deleteAccount = async (req, res) => {
  const { id } = req.params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    await conn.query("SET FOREIGN_KEY_CHECKS = 0");

    // ------------------------------------------------------------------
    // 0. Sanity: make sure the user exists
    // ------------------------------------------------------------------
    const userRows = await conn.query(
      `SELECT user_id FROM techcoach_lite.techcoach_users WHERE user_id = ? FOR UPDATE`,
      [userId],
    );
    if (userRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "User not found" });
    }

    // Collect this user's decision ids once; reused below.
    const decisionRows = await conn.query(
      `SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE user_id = ?`,
      [userId],
    );
    const decisionIds = decisionRows.map((r) => r.decision_id);

    // Collect this user's groups (groups they created).
    const groupRows = await conn.query(
      `SELECT id FROM techcoach_lite.techcoach_groups WHERE created_by = ?`,
      [userId],
    );
    const groupIds = groupRows.map((r) => r.id);

    // Collect comments this user authored (in any decision).
    const commentRows = await conn.query(
      `SELECT id FROM techcoach_lite.techcoach_conversations WHERE groupMember = ?`,
      [userId],
    );
    const commentIds = commentRows.map((r) => r.id);

    // ------------------------------------------------------------------
    // 1. Reactions on comments this user made (child of conversations)
    //    and reactions by this user on anyone's comments.
    // ------------------------------------------------------------------
    if (commentIds.length > 0) {
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_comment_reactions
         WHERE comment_id IN (?)`,
        [commentIds],
      );
    }
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_comment_reactions WHERE user_id = ?`,
      [userId],
    );

    // ------------------------------------------------------------------
    // 2. Ratings on comments authored by this user,
    //    and ratings given by this user.
    // ------------------------------------------------------------------
    if (commentIds.length > 0) {
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_decision_comments_rating
         WHERE comment_id IN (?)`,
        [commentIds],
      );
    }
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_decision_comments_rating WHERE user_id = ?`,
      [userId],
    );

    // ------------------------------------------------------------------
    // 3. Decision ratings (by user, and on this user's decisions)
    // ------------------------------------------------------------------
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_decision_ratings WHERE user_id = ?`,
      [userId],
    );
    if (decisionIds.length > 0) {
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_decision_ratings
         WHERE decision_id IN (?)`,
        [decisionIds],
      );
    }

    // ------------------------------------------------------------------
    // 4. Comments (conversations) — MUST resolve the self-FK first.
    //    Strategy: NULL out parentCommentId for all rows we're about to
    //    delete, then delete rows in bulk. This breaks the self-reference
    //    without disabling FK checks.
    //
    //    We delete:
    //      a) all conversations belonging to this user's decisions
    //      b) all conversations authored by this user (groupMember)
    // ------------------------------------------------------------------
    if (decisionIds.length > 0) {
      await conn.query(
        `UPDATE techcoach_lite.techcoach_conversations
         SET parentCommentId = NULL
         WHERE decisionId IN (?) AND parentCommentId IS NOT NULL`,
        [decisionIds],
      );
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_conversations WHERE decisionId IN (?)`,
        [decisionIds],
      );
    }

    // Comments authored by this user on OTHER users' decisions.
    // First, NULL their parent so they can be deleted.
    if (commentIds.length > 0) {
      await conn.query(
        `UPDATE techcoach_lite.techcoach_conversations
         SET parentCommentId = NULL
         WHERE groupMember = ? AND parentCommentId IS NOT NULL`,
        [userId],
      );
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_conversations WHERE groupMember = ?`,
        [userId],
      );
    }

    // ------------------------------------------------------------------
    // 5. Shared decisions: those on this user's decisions + ones shared
    //    by this user.
    // ------------------------------------------------------------------
    if (decisionIds.length > 0) {
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_shared_decisions WHERE decisionId IN (?)`,
        [decisionIds],
      );
    }
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_shared_decisions WHERE groupMember = ?`,
      [userId],
    );

    // ------------------------------------------------------------------
    // 6. Decision-linked child tables (both by decision and by user)
    // ------------------------------------------------------------------
    if (decisionIds.length > 0) {
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_decision_swot_linked_info WHERE decision_id IN (?)`,
        [decisionIds],
      );
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_decision_reason WHERE decision_id IN (?)`,
        [decisionIds],
      );
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_decision_tag_linked_info WHERE decision_id IN (?)`,
        [decisionIds],
      );
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_decision_tag WHERE decision_id IN (?)`,
        [decisionIds],
      );
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_decision_skill_linked_info WHERE decision_id IN (?)`,
        [decisionIds],
      );
    }
    // User-scoped cleanup on those same tables (rows may exist with user_id
    // even if decision_id isn't in the list, e.g. orphan/linked rows).
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_decision_swot_linked_info WHERE user_id = ?`,
      [userId],
    );
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_decision_skill_linked_info WHERE user_id = ?`,
      [userId],
    );

    // ------------------------------------------------------------------
    // 7. Decisions themselves
    // ------------------------------------------------------------------
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_decision WHERE user_id = ?`,
      [userId],
    );

    // ------------------------------------------------------------------
    // 8. Groups: memberships in this user's groups, then this user's
    //    memberships in ANY group, then the groups this user created.
    // ------------------------------------------------------------------
    if (groupIds.length > 0) {
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_group_members WHERE group_id IN (?)`,
        [groupIds],
      );
    }
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_group_members WHERE member_id = ?`,
      [userId],
    );
    if (groupIds.length > 0) {
      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_groups WHERE id IN (?)`,
        [groupIds],
      );
    }

    // ------------------------------------------------------------------
    // 9. Profile / user-scoped tables
    // ------------------------------------------------------------------
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_soft_skill_value WHERE user_id = ?`,
      [userId],
    );
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_profile_swot_values WHERE user_id = ?`,
      [userId],
    );
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_personal_info WHERE user_id = ?`,
      [userId],
    );
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_mobile_number_info WHERE user_id = ?`,
      [userId],
    );
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_login_history WHERE user_id = ?`,
      [userId],
    );
    await conn.query(
      `DELETE FROM techcoach_lite.user_subscription WHERE user_id = ?`,
      [userId],
    );

    // ------------------------------------------------------------------
    // 10. Finally, the user row itself
    // ------------------------------------------------------------------
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_users WHERE user_id = ?`,
      [userId],
    );

    await conn.commit();
    return res
      .status(200)
      .json({ message: "Account and associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the account" });
  } finally {
    if (conn) {
      try {
        conn.release();
      } catch (releaseErr) {
        console.error("Release failed:", releaseErr);
      }
    }
  }
};


module.exports = { getAllInfo,getInfo, getUserType, getTotalDecisionsCount, getLastLoginDate, deleteAccount }