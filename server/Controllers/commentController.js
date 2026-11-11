// const getConnection = require('../models/database');

// const postComment = async (req, res) => {
//     const { groupId, commentText, decisionId } = req.body;
//     const memberId = req.user.id;

//     let conn;

//     try {
//         conn = await getConnection();
//         await conn.beginTransaction();

//         // Validate groupId
//         const group = await conn.query(
//             'SELECT id FROM techcoach_lite.techcoach_groups WHERE id = ?',
//             [groupId]
//         );
//         if (group.length === 0) {
//             return res.status(400).json({ message: 'Invalid group_id, group does not exist' });
//         }

//         // Validate decisionId
//         const decision = await conn.query(
//             'SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE decision_id = ?',
//             [decisionId]
//         );
//         if (decision.length === 0) {
//             return res.status(400).json({ message: 'Invalid decision_id, decision does not exist' });
//         }

//         // Check if the logged-in user is a member of the group
//         const member = await conn.query(
//             'SELECT member_id FROM techcoach_lite.techcoach_group_members WHERE group_id = ? AND member_id = ?',
//             [groupId, memberId]
//         );
//         if (member.length === 0) {
//             return res.status(403).json({
//                 message: 'You are not authorized to post comments in this group',
//             });
//         }

//         // Insert comment for the logged-in user
//         await conn.query(
//             `
//             INSERT INTO techcoach_lite.techcoach_conversations
//             (groupId, groupMember, comment, decisionId, created_at)
//             VALUES (?, ?, ?, ?, NOW());
//             `,
//             [groupId, memberId, commentText, decisionId]
//         );

//         // Commit transaction
//         await conn.commit();

//         // Return success response
//         res.status(201).json({
//             message: 'Comment added successfully!',
//             comment: {
//                 groupId,
//                 memberId,
//                 comment: commentText,
//                 decisionId,
//             },
//         });
//     } catch (error) {
//         if (conn) {
//             await conn.rollback();
//         }
//         console.error('Error adding comment:', error.message);
//         res.status(500).json({
//             message: 'Server error while adding comment',
//             error: error.message,
//         });
//     } finally {
//         if (conn) {
//             conn.release();
//         }
//     }
// };

const getConnection = require("../Models/database");

const postComment = async (req, res) => {
  const { groupId, commentText, decisionId } = req.body;
  const memberId = req.user.id;
  let conn;

  try {
    await getConnection(async (conn) => {
      await conn.beginTransaction();

      const group = await conn.query(
        "SELECT id FROM techcoach_lite.techcoach_groups WHERE id = ?",
        [groupId],
      );
      if (group.length === 0) {
        res
          .status(400)
          .json({ message: "Invalid group_id, group does not exist" });
        return;
      }

      const decision = await conn.query(
        "SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE decision_id = ?",
        [decisionId],
      );
      if (decision.length === 0) {
        res
          .status(400)
          .json({ message: "Invalid decision_id, decision does not exist" });
        return;
      }

      const member = await conn.query(
        "SELECT member_id FROM techcoach_lite.techcoach_group_members WHERE group_id = ? AND member_id = ?",
        [groupId, memberId],
      );
      if (member.length === 0) {
        res.status(403).json({
          message: "You are not authorized to post comments in this group",
        });
        return;
      }

      await conn.query(
        `INSERT INTO techcoach_lite.techcoach_conversations 
                 (groupId, groupMember, comment, decisionId, created_at)
                 VALUES (?, ?, ?, ?, NOW());`,
        [groupId, memberId, commentText, decisionId],
      );

      await conn.commit();

      res.status(201).json({
        message: "Comment added successfully!",
        comment: {
          groupId,
          memberId,
          comment: commentText,
          decisionId,
        },
      });
    });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Server error while adding comment",
        error: error.message,
      });
    }
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getComments = async (req, res) => {
  const { groupId, decisionId } = req.params;
  const userId = req.user.id;
  let conn;

  try {
    conn = await getConnection();

    const comments = await conn.query(
      `
        SELECT
                tc.id,
                tc.groupId,
                tc.groupMember,
                tc.decisionId,
                tc.comment,
                tc.created_at,
                tc.parentCommentId,
                tc.updated_at,
                tu.user_id,
                tu.displayname,
                tu.email,
                g.type_of_group
            FROM
                techcoach_lite.techcoach_conversations tc
            LEFT JOIN
                techcoach_lite.techcoach_users tu ON tc.groupMember = tu.user_id
            JOIN 
                techcoach_lite.techcoach_groups g ON tc.groupId = g.id    
            WHERE 
                tc.groupId = ? AND tc.decisionId = ?

      `,
      [groupId, decisionId],
    );

    if (comments.length > 0) {
      const ids = comments.map((c) => c.id);
      const ph = ids.map(() => "?").join(",");

      const tagRows = await conn.query(
        `SELECT l.conversation_id, t.id AS tag_id, t.tag_name, t.tag_type
           FROM techcoach_lite.techcoach_conversation_bias_tag_linked_info l
           JOIN techcoach_lite.techcoach_tag_info t ON t.id = l.tag_id
          WHERE l.conversation_id IN (${ph})
          ORDER BY t.tag_name ASC`,
        ids,
      );

      const tagsByComment = new Map();
      for (const row of tagRows) {
        if (!tagsByComment.has(row.conversation_id)) {
          tagsByComment.set(row.conversation_id, []);
        }
        tagsByComment.get(row.conversation_id).push({
          id: row.tag_id,
          tag_name: row.tag_name,
          tag_type: row.tag_type,
        });
      }

      comments.forEach((c) => {
        c.biasTags = tagsByComment.get(c.id) || [];
      });
    } else {
      comments.forEach((c) => { c.biasTags = []; });
    }

    comments.forEach((comment) => {
      comment.type_of_member =
        comment.groupMember === userId ? "author" : "member";
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ message: "Server error while fetching comments" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getDecisionComments = async (req, res) => {
  const { decisionId } = req.params;
  const userId = req.user.id;
  let conn;

  try {
     conn = await getConnection();

    const comments = await conn.query(
      `
        SELECT
                tc.id,
                tc.groupId,
                tc.groupMember,
                tc.decisionId,
                tc.comment,
                tc.created_at,
                tc.parentCommentId,
                tc.updated_at,
                tu.user_id,
                tu.displayname,
                tu.email,
                g.type_of_group
            FROM
                techcoach_lite.techcoach_conversations tc
            LEFT JOIN
                techcoach_lite.techcoach_users tu ON tc.groupMember = tu.user_id
            JOIN 
                techcoach_lite.techcoach_groups g ON tc.groupId = g.id    
            WHERE 
                tc.decisionId = ? AND g.type_of_group = 'decision_circle'

      `,
      [decisionId],
    );

     if (comments.length > 0) {
      const ids = comments.map((c) => c.id);
      const ph = ids.map(() => "?").join(",");

      const tagRows = await conn.query(
        `SELECT l.conversation_id, t.id AS tag_id, t.tag_name, t.tag_type
           FROM techcoach_lite.techcoach_conversation_bias_tag_linked_info l
           JOIN techcoach_lite.techcoach_tag_info t ON t.id = l.tag_id
          WHERE l.conversation_id IN (${ph})
          ORDER BY t.tag_name ASC`,
        ids,
      );

      const tagsByComment = new Map();
      for (const row of tagRows) {
        if (!tagsByComment.has(row.conversation_id)) {
          tagsByComment.set(row.conversation_id, []);
        }
        tagsByComment.get(row.conversation_id).push({
          id: row.tag_id,
          tag_name: row.tag_name,
          tag_type: row.tag_type,
        });
      }

      comments.forEach((c) => {
        c.biasTags = tagsByComment.get(c.id) || [];
      });
    } else {
      comments.forEach((c) => { c.biasTags = []; });
    }

    comments.forEach((comment) => {
      comment.type_of_member =
        comment.groupMember === userId ? "author" : "member";
    });


    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ message: "Server error while fetching comments" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

/* const updateComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { comment } = req.body;
  let conn;

  try {
    const conn = await getConnection();

    const sql = `
        UPDATE techcoach_lite.techcoach_conversations
        SET comment = ?, updated_at = NOW()
        WHERE id = ?
      `;

    const result = await conn.query(sql, [comment, commentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ message: "Comment updated successfully!" });
  } catch (error) {
    console.error("Error updating comment:", error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ message: "Server error while updating comment" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
}; */

const updateComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { comment, biasTagIds, biasTags } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "comment is required" });
  }

  const rawTags = Array.isArray(biasTagIds)
    ? biasTagIds
    : Array.isArray(biasTags)
      ? biasTags
      : null;

  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const sql = `
      UPDATE techcoach_lite.techcoach_conversations
      SET comment = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const result = await conn.query(sql, [comment, commentId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Comment not found" });
    }

    if (rawTags !== null) {
      const uniqueTagIds = [
        ...new Set(
          rawTags
            .map((t) =>
              typeof t === "object" && t !== null ? Number(t.id) : Number(t),
            )
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ];

      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_conversation_bias_tag_linked_info
         WHERE conversation_id = ?`,
        [commentId],
      );

      if (uniqueTagIds.length > 0) {
        const placeholders = uniqueTagIds.map(() => "(?, ?)").join(", ");
        const params = uniqueTagIds.flatMap((tagId) => [commentId, tagId]);

        await conn.query(
          `INSERT INTO techcoach_lite.techcoach_conversation_bias_tag_linked_info
             (conversation_id, tag_id)
           VALUES ${placeholders}`,
          params,
        );
      }
    }

    await conn.commit();
    res.status(200).json({ message: "Comment updated successfully!" });
  } catch (error) {
    console.error("Error updating comment:", error);
    if (conn) await conn.rollback();
    res.status(500).json({ message: "Server error while updating comment" });
  } finally {
    if (conn) conn.release();
  }
};

const replyToComment = async (req, res) => {
  const { parentCommentId, groupId, commentText, decisionId, biasTagIds = [] } = req.body;
  const userId = req.user.id;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const parentComment = await conn.query(
      "SELECT id FROM techcoach_lite.techcoach_conversations WHERE id = ?",
      [parentCommentId],
    );
    if (parentComment.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid parent comment ID, comment does not exist" });
    }

    const group = await conn.query(
      "SELECT id FROM techcoach_lite.techcoach_groups WHERE id = ?",
      [groupId],
    );
    if (group.length === 0) {
      await conn.rollback();
      return res
        .status(400)
        .json({ message: "Invalid group_id, group does not exist" });
    }

    const insertResult = await conn.query(
      `INSERT INTO techcoach_lite.techcoach_conversations
         (groupId, groupMember, comment, decisionId, parentCommentId, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [groupId, userId, commentText, decisionId, parentCommentId],
    );

    const replyId = insertResult.insertId;

    if (Array.isArray(biasTagIds) && biasTagIds.length > 0) {
      const uniqueTagIds = [
        ...new Set(
          biasTagIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ];
      if (uniqueTagIds.length > 0) {
        const placeholders = uniqueTagIds.map(() => "(?, ?)").join(", ");
        const params = uniqueTagIds.flatMap((tagId) => [replyId, tagId]);
        await conn.query(
          `INSERT IGNORE INTO techcoach_lite.techcoach_conversation_bias_tag_linked_info
             (conversation_id, tag_id)
           VALUES ${placeholders}`,
          params,
        );
      }
    }

    await conn.commit();
    res.status(200).json({ message: "Reply added successfully!" });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    console.error("Error adding reply comment:", error);
    res.status(500).json({
      message: "Server error while adding reply comment",
      error: error.message,
    });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  let conn;

  try {
    const conn = await getConnection();

    const result = await conn.query(
      "DELETE FROM techcoach_lite.techcoach_conversations WHERE id = ?",
      [commentId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ message: "Comment deleted successfully!" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ message: "Server error while deleting comment" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const postShareWithComment = async (req, res) => {
  const { groupId, commentText, decisionId, biasTagIds = [] } = req.body;
  const memberId = req.user.id;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const group = await conn.query(
      "SELECT id FROM techcoach_lite.techcoach_groups WHERE id = ?",
      [groupId],
    );
    if (group.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid group_id, group does not exist" });
    }

    const decision = await conn.query(
      "SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE decision_id = ?",
      [decisionId],
    );
    if (decision.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid decision_id, decision does not exist" });
    }

    const member = await conn.query(
      "SELECT member_id FROM techcoach_lite.techcoach_group_members WHERE group_id = ?",
      [groupId],
    );

    if (member.length === 0) {
      return res.status(403).json({
        message: "You are not authorized to post comments in this group",
      });
    }

    const insertResult = await conn.query(
      `
            INSERT INTO techcoach_lite.techcoach_conversations 
            (groupId, groupMember, comment, decisionId, created_at)
            VALUES (?, ?, ?, ?, NOW());
            `,
      [groupId, memberId, commentText, decisionId],
    );

    const conversationId = insertResult.insertId;

    if (Array.isArray(biasTagIds) && biasTagIds.length > 0) {
      const uniqueTagIds = [
        ...new Set(
          biasTagIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ];

      if (uniqueTagIds.length > 0) {
        const placeholders = uniqueTagIds.map(() => "(?, ?)").join(", ");
        const params = uniqueTagIds.flatMap((tagId) => [conversationId, tagId]);

        await conn.query(
          `INSERT IGNORE INTO techcoach_lite.techcoach_conversation_bias_tag_linked_info
         (conversation_id, tag_id)
       VALUES ${placeholders}`,
          params,
        );
      }
    }

    await conn.commit();

    res.status(201).json({
      message: "Comment added successfully!",
      comment: {
        groupId,
        memberId,
        comment: commentText,
        decisionId,
      },
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    console.error("Error adding comment:", error.message);
    res.status(500).json({
      message: "Server error while adding comment",
      error: error.message,
    });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getWithComments = async (req, res) => {
  const { groupId, decisionId } = req.query;
  const userId = req.user.id;
  let conn;

  try {
     conn = await getConnection();

    const comments = await conn.query(
      `
            SELECT DISTINCT
                tc.id AS commentId,
                tc.groupId,
                tg.group_name,
                tc.groupMember,
                gm.member_id,
                gm.status AS memberStatus,
                tc.comment,
                tc.parentCommentId,
                tc.decisionId,
                td.decision_name,
                tc.created_at,
                tc.updated_at,
                tu.user_id,
                tu.displayname,
                tu.email
            FROM 
                techcoach_lite.techcoach_conversations tc
            INNER JOIN 
                techcoach_lite.techcoach_groups tg ON tc.groupId = tg.id
            LEFT JOIN 
                techcoach_lite.techcoach_group_members gm ON tc.groupMember = gm.member_id
            LEFT JOIN
                techcoach_lite.techcoach_users tu ON tc.groupMember = tu.user_id    
            LEFT JOIN 
                techcoach_lite.techcoach_decision td ON tc.decisionId = td.decision_id
            WHERE 
                tc.groupId = ? AND tc.decisionId = ?  
            ORDER BY tc.created_at DESC;     
        `,
      [groupId, decisionId],
    );
    const uniqueComments = Array.from(
      new Map(comments.map((comment) => [comment.commentId, comment])).values(),
    );

     if (uniqueComments.length > 0) {
      const commentIds = uniqueComments.map((c) => c.commentId);

      const tagRows = await conn.query(
        `
          SELECT
              l.conversation_id,
              t.id   AS tag_id,
              t.tag_name,
              t.tag_type
          FROM techcoach_lite.techcoach_conversation_bias_tag_linked_info l
          INNER JOIN techcoach_lite.techcoach_tag_info t ON t.id = l.tag_id
          WHERE l.conversation_id IN (?)
          ORDER BY t.tag_name ASC;
        `,
        [commentIds],
      );

      const tagsByComment = new Map();
      for (const row of tagRows) {
        if (!tagsByComment.has(row.conversation_id)) {
          tagsByComment.set(row.conversation_id, []);
        }
        tagsByComment.get(row.conversation_id).push({
          id: row.tag_id,
          tag_name: row.tag_name,
          tag_type: row.tag_type,
        });
      }

    uniqueComments.forEach((c) => {
        c.biasTags = tagsByComment.get(c.commentId) || [];
        c.type_of_member = c.groupMember === userId ? "author" : "member";
      });
    }

    res.status(200).json({
      message: "Comments retrieved successfully",
      comments: uniqueComments,
    });
  } catch (error) {
    console.error("Error retrieving comments:", error.message);
    res.status(500).json({
      message: "An error occurred while retrieving comments",
      error: error.message,
    });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const editComments = async (req, res) => {
  const { commentId } = req.params;
  const { comment, biasTagIds, biasTags } = req.body;

  if (!commentId || !comment) {
    return res
      .status(400)
      .json({ message: "commentId and comment are required" });
  }

  const rawTags = Array.isArray(biasTagIds)
    ? biasTagIds
    : Array.isArray(biasTags)
      ? biasTags
      : null;

  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const sql = `
      UPDATE techcoach_lite.techcoach_conversations
      SET comment = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const result = await conn.query(sql, [comment, commentId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Comment not found" });
    }

    if (rawTags !== null) {
      const uniqueTagIds = [
        ...new Set(
          rawTags
            .map((tag) =>
              typeof tag === "object" && tag !== null ? Number(tag.id) : Number(tag),
            )
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ];

      await conn.query(
        `DELETE FROM techcoach_lite.techcoach_conversation_bias_tag_linked_info
         WHERE conversation_id = ?`,
        [commentId],
      );

      if (uniqueTagIds.length > 0) {
        const placeholders = uniqueTagIds.map(() => "(?, ?)").join(", ");
        const params = uniqueTagIds.flatMap((tagId) => [commentId, tagId]);

        await conn.query(
          `INSERT INTO techcoach_lite.techcoach_conversation_bias_tag_linked_info
             (conversation_id, tag_id)
           VALUES ${placeholders}`,
          params,
        );
      }
    }

    await conn.commit();
    res.status(200).json({ message: "Comment updated successfully!" });
  } catch (error) {
    console.error("Error updating comment:", error);
    if (conn) await conn.rollback();
    res.status(500).json({ message: "Server error while updating comment" });
  } finally {
    if (conn) conn.release();
  }
};

const postdecisionGroup = async (req, res) => {
  const { type_of_group = "decision_circle", group_name } = req.body;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const created_by = req.user.id;

    const groupResult = await conn.query(
      `INSERT INTO techcoach_lite.techcoach_groups (created_by, created_at, type_of_group, group_name) VALUES (?, NOW(), ?, ?)`,
      [created_by, type_of_group, group_name],
    );

    const groupId = groupResult.insertId
      ? groupResult.insertId.toString()
      : groupResult[0].insertId.toString();
    await conn.commit();

    res
      .status(200)
      .json({ message: "Decision Group Created successfully", groupId });
  } catch (error) {
    console.error("Error in creating Decision Group:", error);
    if (conn) {
      await conn.rollback();
    }
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getAlldecisionGroup = async (req, res) => {
  const { type_of_group = "decision_circle" } = req.query;
  let conn;
  try {
    conn = await getConnection();

    const created_by = req.user.id;

    const query =
      "SELECT id, group_name, type_of_group, created_at FROM techcoach_lite.techcoach_groups WHERE type_of_group = ? AND created_by = ?";
    const rows = await conn.query(query, [type_of_group, created_by]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No decision groups found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching decision group", error);
    if (conn) {
      await conn.rollback();
    }
    res
      .status(500)
      .json({ error: "An error occurred while fetching decision groups" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getDecisionGroup = async (req, res) => {
  const { id } = req.params;

  let conn;
  try {
    conn = await getConnection();

    const rows = await conn.query(
      `SELECT id, group_name, type_of_group FROM techcoach_lite.techcoach_groups WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Decision group not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching decision group by ID:", error);
    if (conn) {
      await conn.rollback();
    }
    res
      .status(500)
      .json({ error: "An error occurred while fetching the decision group" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const putDecisionGroup = async (req, res) => {
  const { id } = req.params;
  const { group_name } = req.body;

  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const existingGroup = await conn.query(
      `SELECT * FROM techcoach_lite.techcoach_groups WHERE id = ?`,
      [id],
    );

    if (existingGroup.length === 0) {
      return res.status(404).json({ message: "Decision group not found" });
    }

    await conn.query(
      `UPDATE techcoach_lite.techcoach_groups SET group_name = ? WHERE id = ?`,
      [group_name, id],
    );

    await conn.commit();

    res.status(200).json({ message: "Decision group updated successfully" });
  } catch (error) {
    console.error("Error updating decision group:", error);
    await conn.rollback();
    res
      .status(500)
      .json({ error: "An error occurred while updating the decision group" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const deleteDecisionGroup = async (req, res) => {
  const { id } = req.params; 

  let conn;
  try {
    conn = await getConnection();

    const existingRows = await conn.query(
      `SELECT * FROM techcoach_lite.techcoach_groups WHERE id = ?`,
      [id],
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Decision group not found" });
    }

    await conn.query(
      `DELETE FROM techcoach_lite.techcoach_groups WHERE id = ?`,
      [id],
    );

    res.status(200).json({ message: "Decision group deleted successfully" });
  } catch (error) {
    console.error("Error deleting decision group:", error);
    if (conn) {
      await conn.rollback();
    }
    res
      .status(500)
      .json({ error: "An error occurred while deleting the decision group" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getBiasTags = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const rows = await conn.query(
      `SELECT id, tag_name, tag_type
       FROM techcoach_lite.techcoach_tag_info
       WHERE tag_type = 'Bias'
       ORDER BY tag_name ASC`,
    );
    res.status(200).json({ biasTags: rows });
  } catch (error) {
    console.error("Error fetching bias tags:", error);
    res.status(500).json({ error: "Failed to fetch bias tags" });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  // Conversation Controllers
  postComment,
  getComments,
  getDecisionComments,
  updateComment,
  replyToComment,
  deleteComment,
  postShareWithComment,
  getWithComments,
  editComments,
  // groupNames controller
  postdecisionGroup,
  getAlldecisionGroup,
  getDecisionGroup,
  putDecisionGroup,
  deleteDecisionGroup,
  getBiasTags,
};
