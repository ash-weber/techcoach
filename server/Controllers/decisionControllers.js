const getConnection = require('../Models/database');
const crypto = require('crypto');

const postInfo = async (req, res) => {
  const { decision_name, user_statement, tags, decision_reason, decision_due_date, decision_taken_date } = req.body;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;
    const userName = req.user.name;

    const currentDate = new Date().toISOString().slice(0, 10);
    // console.log("Current Date:", currentDate);
    
    // console.log("Decision Due Date:", decision_due_date);
    // console.log("Decision Taken Date:", decision_taken_date);

    const formattedDueDate = decision_due_date ? new Date(decision_due_date).toISOString().slice(0, 10) : null;
    const formattedTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().slice(0, 10) : null;

    // console.log("Formatted Due Date:", formattedDueDate);
    // console.log("Formatted Taken Date:", formattedTakenDate);

    function encryptText(text, key) {
      const cipher = crypto.createCipher('aes-256-cbc', key);
      let encryptedText = cipher.update(text, 'utf8', 'hex');
      encryptedText += cipher.final('hex');
      return encryptedText;
    }

    const decisionReasonTexts = Array.isArray(decision_reason) ? decision_reason.map(item => item.decision_reason_text) : [];
    const encryptedReasonTexts = decisionReasonTexts.map(reasonText => encryptText(reasonText, req.user.key));
    const encryptedDecisionName = encryptText(decision_name, req.user.key);
    const encryptedUserStatement = encryptText(user_statement, req.user.key);

    const decisionResult = await conn.query(
      "INSERT INTO techcoach_lite.techcoach_decision (decision_name, created_by, creation_date, decision_due_date, decision_taken_date, user_statement, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [encryptedDecisionName, userName, currentDate, formattedDueDate, formattedTakenDate, encryptedUserStatement, userId]
    );

    const decisionId = decisionResult.insertId;

    const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : []);
    for (const tagName of tagsArray) {
      if (tagName && tagName.length > 0) {
        const tagRows = await conn.query(
          "SELECT id FROM techcoach_lite.techcoach_tag_info WHERE tag_name = ?",
          [tagName.trim()]
        );

        if (tagRows.length > 0) {
          const tagId = tagRows[0].id;
          await conn.query(
            "INSERT INTO techcoach_lite.techcoach_decision_tag_linked_info (decision_id, tag_id) VALUES (?, ?)",
            [decisionId, tagId]
          );
        } else {
          console.error(`Tag name ${tagName} not found in techcoach_tag_info`);
        }
      }
    }

    for (const encryptedReasonText of encryptedReasonTexts) {
      await conn.query(
        "INSERT INTO techcoach_lite.techcoach_decision_reason (decision_id, decision_reason_text) VALUES (?, ?)",
        [decisionId, encryptedReasonText]
      );
    }

    await conn.commit();
    res.status(200).json({ message: 'Data inserted successfully' });

  } catch (error) {
    console.error('Error inserting data:', error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while processing your request' });
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

    const decisionData = await conn.query(
      `SELECT 
        d.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', t.id,
            'tag_name', t.tag_name,
            'tag_type', t.tag_type
          )
        ) AS tags,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', r.reason_id,
            'decision_reason_text', r.decision_reason_text
          )
        ) AS reasons
      FROM 
        techcoach_lite.techcoach_decision d
      LEFT JOIN 
        techcoach_lite.techcoach_decision_tag_linked_info dt ON d.decision_id = dt.decision_id
      LEFT JOIN 
        techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
      LEFT JOIN 
        techcoach_lite.techcoach_decision_reason r ON d.decision_id = r.decision_id
      WHERE
        d.decision_id = ?
      GROUP BY
        d.decision_id
      `, [id]
    );

    if (!decisionData || decisionData.length === 0) {
      console.error('Decision not found for ID:', id);
      return res.status(404).json({ error: 'Decision not found' });
    }

    const decryptText = (text, key) => {
      if (!text) return text; 
      try {
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        let decryptedText = decipher.update(text, 'hex', 'utf8');
        decryptedText += decipher.final('utf8');
        return decryptedText;
      } catch (error) {
        console.error('Error decrypting text:', error);
        return null;
      }
    };

    const decryptedDecisionData = decisionData.map(decision => {
      const tags = typeof decision.tags === 'string' ? JSON.parse(decision.tags) : decision.tags;
      const reasons = typeof decision.reasons === 'string' ? JSON.parse(decision.reasons) : decision.reasons;

      return {
        decision_id: decision.decision_id,
        decision_name: decryptText(decision.decision_name, req.user.key),
        user_statement: decryptText(decision.user_statement, req.user.key),
        decision_due_date: decision.decision_due_date,
        decision_taken_date: decision.decision_taken_date,
        tags: tags.map(tag => ({
          id: tag.id,
          tag_name: tag.tag_name,
          tag_type: tag.tag_type
        })),
        decision_reason: reasons.map(reason => ({
          id: reason.id,
          decision_reason_text: decryptText(reason.decision_reason_text, req.user.key)
        }))
      };
    });

    res.status(200).json({ decisionData: decryptedDecisionData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getInfo_Referred = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await getConnection();

    const decisionData = await conn.query(
      `SELECT 
        d.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', t.id,
            'tag_name', t.tag_name,
            'tag_type', t.tag_type
          )
        ) AS tags,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', r.reason_id,
            'decision_reason_text', r.decision_reason_text
          )
        ) AS reasons
      FROM 
        techcoach_lite.techcoach_decision d
      LEFT JOIN 
        techcoach_lite.techcoach_decision_tag_linked_info dt ON d.decision_id = dt.decision_id
      LEFT JOIN 
        techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
      LEFT JOIN 
        techcoach_lite.techcoach_decision_reason r ON d.decision_id = r.decision_id
      WHERE
        d.decision_id = ?
      GROUP BY
        d.decision_id
      `, [id]
    );


    if (!decisionData || decisionData.length === 0) {
      console.error('Decision not found for ID:', id);
      return res.status(404).json({ error: 'Decision not found' });
    }

    const decryptText = (text, key) => {
      if (!text) return text; 
      try {
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        let decryptedText = decipher.update(text, 'hex', 'utf8');
        decryptedText += decipher.final('utf8');
        return decryptedText;
      } catch (error) {
        console.error('Error decrypting text:', error);
        return null;
      }
    };

    const decryptedDecisionData = decisionData.map(decision => {

      // console.log("decisionnnnnnnnnnnnnnnnnnnnnnnnnnn", decision);  

      const tags = typeof decision.tags === 'string' ? JSON.parse(decision.tags) : decision.tags; 
      const reasons = typeof decision.reasons === 'string' ? JSON.parse(decision.reasons) : decision.reasons;

      const removeDuplicates = (array) => {
        const uniqueIds = new Set();
        return array.filter(item => {
          if (!uniqueIds.has(item.id)) {
            uniqueIds.add(item.id);
            return true;
          }
          return false;
        });
      };

      return {
        decision_id: decision.decision_id,
        decision_name: decryptText(decision.decision_name, req.user.key),
        user_statement: decryptText(decision.user_statement, req.user.key),
        decision_due_date: decision.decision_due_date,
        decision_taken_date: decision.decision_taken_date,
        tags: removeDuplicates(tags.map(tag => ({
          id: tag.id,
          tag_name: tag.tag_name,
          tag_type: tag.tag_type
        }))),
        decision_reason: removeDuplicates(reasons.map(reason => ({
          id: reason.id,
          decision_reason_text: decryptText(reason.decision_reason_text, req.user.key)
        })))
      };
    });

    res.status(200).json({ decisionData: decryptedDecisionData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getallInfo = async (req, res) => {
  let conn;
  // console.log('qawqaw')
  // console.log(req.user)

  try {
    conn = await getConnection();

    const decisionData = await conn.query(
      `SELECT 
        d.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', t.id,
            'tag_name', t.tag_name,
            'tag_type', t.tag_type
          )
        ) AS tags,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', r.reason_id,
            'decision_reason_text', r.decision_reason_text
          )
        ) AS reasons
      FROM 
        techcoach_lite.techcoach_decision d
      LEFT JOIN 
        techcoach_lite.techcoach_decision_tag_linked_info dt ON d.decision_id = dt.decision_id
      LEFT JOIN 
        techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
      LEFT JOIN 
        techcoach_lite.techcoach_decision_reason r ON d.decision_id = r.decision_id
      GROUP BY
        d.decision_id
      `
    );

    const decryptText = (text, key) => {
      if (!text) return text; 
      try {
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        let decryptedText = decipher.update(text, 'hex', 'utf8');
        decryptedText += decipher.final('utf8');
        return decryptedText;
      } catch (error) {
        console.error('Error decrypting text:', error);
        return null;
      }
    };

    const decryptedDecisionData = decisionData.map(decision => {
      const tags = typeof decision.tags === 'string' ? JSON.parse(decision.tags) : decision.tags;
      const reasons = typeof decision.reasons === 'string' ? JSON.parse(decision.reasons) : decision.reasons;

      return {
        decision_id: decision.decision_id,
        decision_name: decryptText(decision.decision_name, req.user.key),
        user_statement: decryptText(decision.user_statement, req.user.key),
        decision_due_date: decision.decision_due_date,
        decision_taken_date: decision.decision_taken_date,
        tags: tags.map(tag => ({
          id: tag.id,
          tag_name: tag.tag_name,
          tag_type: tag.tag_type
        })),
        decision_reason: reasons.map(reason => ({
          id: reason.id,
          decision_reason_text: decryptText(reason.decision_reason_text, req.user.key)
        }))
      };
    });

    res.status(200).json({ decisionData: decryptedDecisionData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const putInfo = async (req, res) => {
  const { id } = req.params;
  const { decision_name, user_statement, tags, decision_reason, decision_due_date, decision_taken_date } = req.body;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;
    const userName = req.user.name;
    const currentDate = new Date().toISOString().slice(0, 10);

    const formattedDueDate = decision_due_date ? new Date(decision_due_date).toISOString().slice(0, 10) : null;
    const formattedTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().slice(0, 10) : null;

    function encryptText(text, key) {
      const cipher = crypto.createCipher('aes-256-cbc', key);
      let encryptedText = cipher.update(text, 'utf8', 'hex');
      encryptedText += cipher.final('hex');
      return encryptedText;
    }

    const decisionReasonTexts = Array.isArray(decision_reason) ? decision_reason.map(item => item.decision_reason_text) : [];
    const encryptedReasonTexts = decisionReasonTexts.map(reasonText => encryptText(reasonText, req.user.key));
    const encryptedDecisionName = encryptText(decision_name, req.user.key);
    const encryptedUserStatement = encryptText(user_statement, req.user.key);

    // Update the decision record
    await conn.query(
      "UPDATE techcoach_lite.techcoach_decision SET decision_name = ?, decision_due_date = ?, decision_taken_date = ?, user_statement = ?, user_id = ? WHERE decision_id = ?",
      [encryptedDecisionName, formattedDueDate, formattedTakenDate, encryptedUserStatement, userId, id]
    );

    // Retrieve existing tags
    const existingTagRows = await conn.query(
      `SELECT t.tag_name
       FROM techcoach_lite.techcoach_decision_tag_linked_info dt
       JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
       WHERE dt.decision_id = ?`,
      [id]
    );

    const existingTags = existingTagRows.map(row => row.tag_name);
    const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : []);

    const tagsToAdd = tagsArray.filter(tag => !existingTags.includes(tag));
    const tagsToRemove = existingTags.filter(tag => !tagsArray.includes(tag));

    // Remove tags
    for (const tagName of tagsToRemove) {
      const tagRows = await conn.query(
        "SELECT id FROM techcoach_lite.techcoach_tag_info WHERE tag_name = ?",
        [tagName.trim()]
      );

      if (tagRows.length > 0) {
        const tagId = tagRows[0].id;
        await conn.query(
          "DELETE FROM techcoach_lite.techcoach_decision_tag_linked_info WHERE decision_id = ? AND tag_id = ?",
          [id, tagId]
        );
      }
    }

    // Add new tags
    for (const tagName of tagsToAdd) {
      if (tagName && tagName.trim().length > 0) {
        const tagRows = await conn.query(
          "SELECT id FROM techcoach_lite.techcoach_tag_info WHERE tag_name = ?",
          [tagName.trim()]
        );

        if (tagRows.length > 0) {
          const tagId = tagRows[0].id;
          await conn.query(
            "INSERT INTO techcoach_lite.techcoach_decision_tag_linked_info (decision_id, tag_id) VALUES (?, ?)",
            [id, tagId]
          );
        } else {
          console.error(`Tag name ${tagName} not found in techcoach_tag_info`);
        }
      }
    }

    // Remove existing reasons
    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_decision_reason 
       WHERE decision_id = ?`,
      [id]
    );

    // Add new reasons
    for (const encryptedReasonText of encryptedReasonTexts) {
      await conn.query(
        "INSERT INTO techcoach_lite.techcoach_decision_reason (decision_id, decision_reason_text) VALUES (?, ?)",
        [id, encryptedReasonText]
      );
    }

    await conn.commit();
    res.status(200).json({ message: 'Data updated successfully' });

  } catch (error) {
    console.error('Error updating data:', error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const deleteInfo = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();


     // Delete from dependent tables first
     await conn.query(
      "DELETE FROM techcoach_lite.techcoach_decision_skill_linked_info WHERE decision_id = ?",
      [id]
    );

    await conn.query(
      "DELETE FROM techcoach_lite.techcoach_decision_swot_linked_info WHERE decision_id = ?",
      [id]
    );
    
    await conn.query(
      "DELETE FROM techcoach_lite.techcoach_decision_tag_linked_info WHERE decision_id = ?",
      [id]
    );

    await conn.query(
      "DELETE FROM techcoach_lite.techcoach_decision_reason WHERE decision_id = ?",
      [id]
    );

    await conn.query(
      "DELETE FROM techcoach_lite.techcoach_decision WHERE decision_id = ?",
      [id]
    );

    // Commit transaction and send success response
    await conn.commit();
    if (conn) conn.release() 

    res.status(200).json({ message: 'Data deleted successfully' });

  } catch (error) {
    console.error('Error deleting data:', error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getall = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();
    const user = req.user;

    if (!user) {
      throw new Error('Missing user parameter in query');
    }


    const decisionData = await conn.query(
      `SELECT 
        d.*,
        JSON_ARRAYAGG(DISTINCT
          JSON_OBJECT(
            'id', dt.id,
            'tag_name', t.tag_name,
            'tag_type', t.tag_type
          )
        ) AS tags,
        JSON_ARRAYAGG(DISTINCT
          JSON_OBJECT(
            'id', r.reason_id,
            'decision_reason_text', r.decision_reason_text
          )
        ) AS reasons
      FROM 
        techcoach_lite.techcoach_decision d
      LEFT JOIN 
        techcoach_lite.techcoach_decision_tag_linked_info dt ON d.decision_id = dt.decision_id
      LEFT JOIN 
        techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
      LEFT JOIN 
        techcoach_lite.techcoach_decision_reason r ON d.decision_id = r.decision_id
      WHERE 
        d.user_id = ?
      GROUP BY 
        d.decision_id
      ORDER BY 
        d.decision_id DESC`,
      [user.id]
    );

    // Define decryptText function
    const decryptText = (text, key) => {
      if (!text) return null; // Ensure text is defined
      try {
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        let decryptedText = decipher.update(text, 'hex', 'utf8');
        decryptedText += decipher.final('utf8');
        return decryptedText;
      } catch (error) {
        console.error('Error decrypting text:', error);
        return null;
      }
    };

    // Decrypt decision data
    const decryptedDecisionData = decisionData.map(decision => {
      const tags = Array.isArray(decision.tags) ? decision.tags : JSON.parse(decision.tags || '[]');
      const reasons = typeof decision.reasons === 'string' ? JSON.parse(decision.reasons) : decision.reasons;


      return {
        decision_id: decision.decision_id,
        decision_name: decryptText(decision.decision_name, req.user.key),
        user_statement: decryptText(decision.user_statement, req.user.key),
        decision_creation_date : decision.creation_date,
        decision_due_date: decision.decision_due_date,
        decision_taken_date: decision.decision_taken_date,
        tags: tags.map(tag => ({
          id: tag.id,
          tag_name: tag.tag_name,
          tag_type: tag.tag_type
        })),
        decision_reason: reasons.map(reason => ({
          id: reason.id,
          decision_reason_text: decryptText(reason.decision_reason_text, req.user.key)
        }))
      };
    });

    // console.log('Decrypted Decisions:', decryptedDecisionData);

    res.status(200).json({ decisionData: decryptedDecisionData });
  } catch (error) {
    console.error('Error processing query parameters:', error);
    if (conn) {
      await conn.rollback(); // Rollback the transaction in case of error
    }
    res.status(500).send({ message: 'Internal Server Error' }); // Handle the error gracefully
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getMonthlyDecisionCount = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const userId = req.user.id;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startDate = startOfMonth.toISOString().slice(0, 10);

    const rows = await conn.query(
      `SELECT COUNT(*) AS count
       FROM techcoach_lite.techcoach_decision
       WHERE user_id = ?
       AND creation_date >= ?`,
      [userId, startDate]
    );

    // ✅ FIX: Convert BigInt to Number
    const monthlyCount = Number(rows[0].count);

    const LIMIT = 10;

    // TODO: replace with real subscription DB check
    const isSubscribed = false;

    res.status(200).json({
      monthlyCount,
      limit: LIMIT,
      subscriptionRequired: !isSubscribed && monthlyCount >= LIMIT,
      isSubscribed
    });

  } catch (error) {
    console.error('Monthly decision count error:', error);
    res.status(500).json({
      message: 'Failed to fetch monthly count',
      error: error.message
    });
  } finally {
    if (conn) conn.release();
  }
};



module.exports = { postInfo, getallInfo, getInfo, putInfo, deleteInfo, getall, getInfo_Referred, getMonthlyDecisionCount };