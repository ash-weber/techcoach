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



const getConnection = require('../models/database');

const postComment = async (req, res) => {
    const { groupId, commentText, decisionId } = req.body;
    const memberId = req.user.id;
    let conn;

    try {
        await getConnection(async (conn) => {
            await conn.beginTransaction();

            const group = await conn.query(
                'SELECT id FROM techcoach_lite.techcoach_groups WHERE id = ?',
                [groupId]
            );
            if (group.length === 0) {
                res.status(400).json({ message: 'Invalid group_id, group does not exist' });
                return;
            }

            // Validate decisionId
            const decision = await conn.query(
                'SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE decision_id = ?',
                [decisionId]
            );
            if (decision.length === 0) {
                res.status(400).json({ message: 'Invalid decision_id, decision does not exist' });
                return;
            }

            // Check group membership
            const member = await conn.query(
                'SELECT member_id FROM techcoach_lite.techcoach_group_members WHERE group_id = ? AND member_id = ?',
                [groupId, memberId]
            );
            if (member.length === 0) {
                res.status(403).json({
                    message: 'You are not authorized to post comments in this group',
                });
                return;
            }

            // Insert the comment
            await conn.query(
                `INSERT INTO techcoach_lite.techcoach_conversations 
                 (groupId, groupMember, comment, decisionId, created_at)
                 VALUES (?, ?, ?, ?, NOW());`,
                [groupId, memberId, commentText, decisionId]
            );

            await conn.commit();

            res.status(201).json({
                    message: 'Comment added successfully!',
                    comment: {
                        groupId,
                        memberId,
                        comment: commentText,
                        decisionId,
                    }
                });

        });
    } catch (error) {
        console.error('Error adding comment:', error.message);
         if (!res.headersSent) {
            res.status(500).json({
                message: 'Server error while adding comment',
                error: error.message,
            });
        }
    }
    finally {
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
        const conn = await getConnection();

        const comments = await conn.query(`
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

      `, [groupId, decisionId]);


      comments.forEach(comment => {
        comment.type_of_member = comment.groupMember === userId ? 'author' : 'member';
    });

        res.status(200).json({comments});

    } catch (error) {
        console.error('Error fetching comments:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ message: 'Server error while fetching comments' });
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
        const conn = await getConnection();

        const comments = await conn.query(`
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

      `, [decisionId]);


      comments.forEach(comment => {
        comment.type_of_member = comment.groupMember === userId ? 'author' : 'member';
    });

        res.status(200).json({comments});

    } catch (error) {
        console.error('Error fetching comments:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ message: 'Server error while fetching comments' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const updateComment = async (req, res) => {
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
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment updated successfully!' });
    } catch (error) {
        console.error('Error updating comment:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ message: 'Server error while updating comment' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const replyToComment = async (req, res) => {
    const { parentCommentId, groupId, commentText, decisionId } = req.body;
    const userId = req.user.id;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const parentComment = await conn.query('SELECT id FROM techcoach_lite.techcoach_conversations WHERE id = ?', [parentCommentId]);
        if (parentComment.length === 0) {
            return res.status(400).json({ message: 'Invalid parent comment ID, comment does not exist' });
        }

        const group = await conn.query('SELECT id FROM techcoach_lite.techcoach_groups WHERE id = ?', [groupId]);
        if (group.length === 0) {
            return res.status(400).json({ message: 'Invalid group_id, group does not exist' });
        }

        const sql = `
            INSERT INTO techcoach_lite.techcoach_conversations 
            (groupId, groupMember, comment, decisionId, parentCommentId, created_at)
            VALUES (?, ?, ?, ?, ?, NOW());
        `;
        const params = [groupId, userId, commentText, decisionId, parentCommentId];
        await conn.query(sql, params);

        await conn.commit();
        res.status(200).json({ message: 'Reply added successfully!' });
    } catch (error) {
        if (conn) {
            await conn.rollback();
        }
        console.error('Error adding reply comment:', error);
        res.status(500).json({ message: 'Server error while adding reply comment', error: error.message });
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

        const result = await conn.query('DELETE FROM techcoach_lite.techcoach_conversations WHERE id = ?', [commentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment deleted successfully!' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ message: 'Server error while deleting comment' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const postShareWithComment = async (req, res) => {
    const { groupId, commentText, decisionId } = req.body;
    const memberId = req.user.id;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        // Validate groupId
        const group = await conn.query(
            'SELECT id FROM techcoach_lite.techcoach_groups WHERE id = ?',
            [groupId]
        );
        if (group.length === 0) {
            return res.status(400).json({ message: 'Invalid group_id, group does not exist' });
        }

        // Validate decisionId
        const decision = await conn.query(
            'SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE decision_id = ?',
            [decisionId]
        );
        if (decision.length === 0) {
            return res.status(400).json({ message: 'Invalid decision_id, decision does not exist' });
        }

        const member = await conn.query(
            'SELECT member_id FROM techcoach_lite.techcoach_group_members WHERE group_id = ? AND member_id = ?',
            [groupId, memberId]
        );
        if (member.length === 0) {
            return res.status(403).json({
                message: 'You are not authorized to post comments in this group',
            });
        }
        
        await conn.query(
            `
            INSERT INTO techcoach_lite.techcoach_conversations 
            (groupId, groupMember, comment, decisionId, created_at)
            VALUES (?, ?, ?, ?, NOW());
            `,
            [groupId, memberId, commentText, decisionId]
        );

        // Commit transaction
        await conn.commit();

        // Return success response
        res.status(201).json({
            message: 'Comment added successfully!',
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
        console.error('Error adding comment:', error.message);
        res.status(500).json({
            message: 'Server error while adding comment',
            error: error.message,
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const getWithComments = async (req, res) => {
    const { groupId,decisionId } = req.query;
    const userId = req.user.id;
    let conn;

    try {
        const conn = await getConnection(); 

        // Base query
        const comments = await conn.query(`
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
        `,[groupId, decisionId]);
        const uniqueComments = Array.from(
            new Map(comments.map((comment) => [comment.commentId, comment])).values()
        );

        uniqueComments.forEach((comment) => {
            comment.type_of_member = comment.groupMember === userId ? 'author' : 'member';
        });
        res.status(200).json({
            message: 'Comments retrieved successfully',
            comments: uniqueComments,
        });
    } catch (error) {
        console.error('Error retrieving comments:', error.message);
        res.status(500).json({
            message: 'An error occurred while retrieving comments',
            error: error.message,
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const editComments = async (req, res) => {
    const { commentId }  = req.params;
    const { comment } = req.body; 
    let conn;

    if (!commentId || !comment) {
        return res.status(400).json({ message: 'commentId and comment are required' });
    }

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
            return res.status(404).json({ message: 'Comment not found' });
        }

        await conn.commit();
        res.status(200).json({ 
            message: 'Comment updated successfully!' });
    } catch (error) {
        console.error('Error updating comment:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ message: 'Server error while updating comment' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


// group name Controllers
const postdecisionGroup = async (req, res) => {
    const { type_of_group = 'decision_circle', group_name } = req.body;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const created_by = req.user.id;

        const groupResult = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_groups (created_by, created_at, type_of_group, group_name) VALUES (?, NOW(), ?, ?)`,
            [created_by, type_of_group, group_name]
        );

        const groupId = groupResult.insertId ? groupResult.insertId.toString() : groupResult[0].insertId.toString();
        await conn.commit();

        res.status(200).json({ message: 'Decision Group Created successfully', groupId });
    } catch (error) {
        console.error('Error in creating Decision Group:', error);
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

const getAlldecisionGroup = async (req, res) => {
    const {type_of_group ="decision_circle"} = req.query;
    let conn;
    try {
        conn = await getConnection();

        const created_by = req.user.id;

        // Fetch group_name and type_of_group from the decision group table
        const query = 'SELECT id, group_name, type_of_group, created_at FROM techcoach_lite.techcoach_groups WHERE type_of_group = ? AND created_by = ?';
        const rows = await conn.query(query, [type_of_group,created_by]);

        // Check if any rows are returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No decision groups found' });
        }

        // Return the results as JSON
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching decision group', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'An error occurred while fetching decision groups' });
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
            [id]
        );

        // Check if any rows are returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Decision group not found' });
        }

        // Return the results as JSON
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching decision group by ID:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'An error occurred while fetching the decision group' });
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
            [id]
        );

        if (existingGroup.length === 0) {
            return res.status(404).json({ message: 'Decision group not found' });
        }

        // Update the decision group data
        await conn.query(
            `UPDATE techcoach_lite.techcoach_groups SET group_name = ? WHERE id = ?`,
            [group_name, id]
        );

        await conn.commit();

        res.status(200).json({ message: 'Decision group updated successfully' });
    } catch (error) {
        console.error('Error updating decision group:', error);
        await conn.rollback();
        res.status(500).json({ error: 'An error occurred while updating the decision group' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const deleteDecisionGroup = async (req, res) => {
    const { id } = req.params; // Get id from URL parameters

    let conn;
    try {
        conn = await getConnection();

        // Check if the decision group exists before deleting
        const existingRows = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_groups WHERE id = ?`,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Decision group not found' });
        }

        // Delete the decision group
        await conn.query(
            `DELETE FROM techcoach_lite.techcoach_groups WHERE id = ?`,
            [id]
        );

        res.status(200).json({ message: 'Decision group deleted successfully' });
    } catch (error) {
        console.error('Error deleting decision group:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'An error occurred while deleting the decision group' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};



module.exports = {
    // Conversation Controllers
    postComment,getComments,getDecisionComments,updateComment,replyToComment,deleteComment,postShareWithComment,getWithComments, editComments,
// groupNames controller
postdecisionGroup,getAlldecisionGroup,getDecisionGroup,putDecisionGroup,deleteDecisionGroup,}