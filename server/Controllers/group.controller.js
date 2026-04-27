const getConnection = require('../Models/database');
const crypto = require('crypto');
const axios = require('axios');

const getUserList = async (req, res) => {
    try {

        const userId = req.user.id;
        // console.log("user id from get user list", userId);
        conn = await getConnection();
        await conn.beginTransaction();

        const tasks = await conn.query(`
      SELECT * FROM techcoach_lite.techcoach_users WHERE user_id != ?;
    `, [userId]);

        await conn.commit();
        if (conn) conn.release();
        res.status(200).json({ message: 'User List Fetched successfully', tasks });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


const innerCircleCreation = async (req, res) => {
    // console.log("Request from creation of inner circle", req.body);

    const { type_of_group, members } = req.body;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const created_by = req.user.id;
        //console.log("user id from circle creation", created_by);

        const groupResult = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_groups (created_by, type_of_group, created_at) VALUES (?, ?, NOW())`,
            [created_by, type_of_group]
        );

        //console.log("Result from groups", groupResult);

        const insertId = groupResult.insertId.toString();
        const numericPart = insertId.split('n')[0];
        const groupId = parseInt(numericPart);

        for (const member of members) {
            const memberId = member.user_id;
            await conn.query(
                `INSERT INTO techcoach_lite.techcoach_group_members (group_id, member_id, status) VALUES (?, ?,?)`,
                [groupId, memberId, '']
            );
        }

        await conn.commit();
        //console.log('Inner Circle Created successfully');
        res.status(200).json({ message: 'Inner Circle Created successfully', groupId });
    } catch (error) {
        console.error('Error in creating Inner Circle', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


const checkInnerCircleExists = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = `
            SELECT COUNT(*) AS count 
            FROM techcoach_lite.techcoach_groups 
            WHERE created_by = ?
        `;
        const userId = req.user.id;
        const [result] = await conn.query(query, [userId]);

        //console.log("count", result);

        const count = result.count;
        const exists = count > 0n ? true : false;

        await conn.commit();
        res.status(200).json({ message: 'Inner Circle fetched', exists });
    } catch (error) {
        console.error('Error in Inner Circle fetching', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const getInnerCircleDetails = async (req, res) => {
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const userId = req.user.id;

        const groupQuery = `
            SELECT id, created_by, type_of_group, created_at
            FROM techcoach_lite.techcoach_groups
            WHERE created_by = ?
        `;

        const [groupResult] = await conn.query(groupQuery, [userId]);

        if (groupResult === undefined) {
            return res.status(200).json({ error: 'No groups found for this user' });
        }

        const groupId = groupResult.id;

        const groupMemberQuery = `
            SELECT member_id, status
            FROM techcoach_lite.techcoach_group_members
            WHERE group_id = ?
        `;

        const groupMemberResult = await conn.query(groupMemberQuery, [groupId]);


        if (groupMemberResult.length === 0) {
            return res.status(200).json({ group: groupResult, error: 'No members found for this group' });
        }

        const memberDetailsQuery = `
            SELECT user_id, displayname, email 
            FROM techcoach_lite.techcoach_users 
            WHERE user_id = ?
        `;

        const memberDetailsPromises = groupMemberResult.map(async (member) => {
            const memberDetailsResult = await conn.query(memberDetailsQuery, [member.member_id]);
            if (memberDetailsResult.length > 0) {
                // Assuming only one result per user_id
                const memberDetail = memberDetailsResult[0];
                return { ...memberDetail, status: member.status };
            }
            return null;
        });

        const memberDetailsResult = (await Promise.all(memberDetailsPromises)).filter(Boolean);


        await conn.commit();
        res.status(200).json({ group: groupResult, members: memberDetailsResult });
    } catch (error) {
        console.error('Error fetching Inner Circle details', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'An error occurred while fetching the group details' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


const removeMemberFromInner = async (req, res) => {
    //console.log("request from remove", req.body);

    const { userId, group_id } = req.body;

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();


        const query = `
            DELETE FROM techcoach_lite.techcoach_group_members
            WHERE member_id = ? AND group_id = ?
        `;
        const result = await conn.query(query, [userId, group_id]);


        await conn.commit();
        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error in removing member from inner circle', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const getAddMemberNameList = async (req, res) => {
    const { existingMemberIds } = req.body;
    // console.log("request body from add member", existingMemberIds);

    const userId = req.user.id;

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        let query;
        let queryParams = [];

        if (existingMemberIds.length === 0) {
            query = `
                SELECT * 
                FROM techcoach_lite.techcoach_users 
                WHERE user_id != ?
            `;
            queryParams = [userId];
        } else {
            query = `
                SELECT * 
                FROM techcoach_lite.techcoach_users 
                WHERE user_id NOT IN (?) AND user_id != ?
            `;
            queryParams = [existingMemberIds, userId];
        }

        const result = await conn.query(query, queryParams);


        await conn.commit();
        res.status(200).json({ message: 'Members fetched successfully', result });
    } catch (error) {
        console.error('Error in fetching potential members', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
}


const addMemberInInnerCircle = async (req, res) => {

    // console.log("request body from add member list", req.body.data);
    const { userId, groupId } = req.body.data;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = `
        INSERT INTO techcoach_lite.techcoach_group_members (group_id, member_id, status) VALUES (?, ?,?)
    `;

        const result = await conn.query(query, [groupId, userId, '']);

        //console.log("result from Add member query", result);

        await conn.commit();
        res.status(200).json({ message: 'Member added sucessfully' });
    } catch (error) {
        console.error('Error in adding member to inner circle', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
}


const shareDecisionInInnerCircle = async (req, res) => {
    const { decisionId, groupId, memberId } = req.body;
    // console.log("req body frommmm share decisionnnnnnn", req.body);
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        await conn.query(`
            INSERT INTO techcoach_lite.techcoach_shared_decisions (groupId, groupMember, decisionId)
            VALUES (?, ?, ?)
        `, [groupId, memberId, decisionId]);

        await conn.commit();

        res.status(200).json({ message: 'Decision shared successfully' });
    } catch (error) {
        console.error('Error sharing decision:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const getSharedMembers = async (req, res) => {
    const { groupId, decisionId } = req.body;
    // console.log("reqqqqqqqqqq body", req.body);
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const result = await conn.query(`
            SELECT groupMember FROM techcoach_lite.techcoach_shared_decisions WHERE groupId = ? AND decisionId = ?
        `, [groupId, decisionId]);

        await conn.commit();

        res.status(200).json({ message: 'Shared Members Fetched Successfully', result });
    } catch (error) {
        console.error('Error fetching shared members:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const getInnerCircleAcceptNotification = async (req, res) => {
    let conn;
    let userId = req.user.id;

    // console.log("User Id:", userId);
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const notAcceptedMembersQuery = `
            SELECT *
            FROM techcoach_lite.techcoach_group_members
            WHERE member_id = ? AND status = ''
        `;
        const notAcceptedMembersResult = await conn.query(notAcceptedMembersQuery, [userId]);

        // console.log("Not Accepted Members:", notAcceptedMembersResult);

        if (notAcceptedMembersResult.length > 0) {
            const groupIds = notAcceptedMembersResult.map(member => member.group_id);


            const acceptedMembersQuery = `
                SELECT *
                FROM techcoach_lite.techcoach_group_members
                WHERE group_id IN (?) AND status = 'Accepted'
            `;

            const acceptedMembersResult = await conn.query(acceptedMembersQuery, [groupIds]);


            const groupDetailsMap = {};

            for (const member of notAcceptedMembersResult) {
                const groupId = member.group_id;

                const groupQuery = `
                    SELECT created_by
                    FROM techcoach_lite.techcoach_groups
                    WHERE id = ?
                `;
                const groupResult = await conn.query(groupQuery, [groupId]);

                if (groupResult.length > 0) {
                    const createdBy = groupResult[0].created_by;

                    const userQuery = `
                        SELECT *
                        FROM techcoach_lite.techcoach_users
                        WHERE user_id = ?`;

                    const userResult = await conn.query(userQuery, [createdBy]);
                    groupDetailsMap[groupId] = {
                        createdBy,
                        userDetails: userResult.length > 0 ? userResult[0] : null
                    };
                }
            }

            const acceptedDetailsMap = {};

            for (const member of acceptedMembersResult) {
                const createdBy = member.member_id;

                const userQuery = `
                    SELECT *
                    FROM techcoach_lite.techcoach_users
                    WHERE user_id = ?
                `;
                const userResult = await conn.query(userQuery, [createdBy]);

                acceptedDetailsMap[member.group_id] = {
                    userDetails: userResult.length > 0 ? userResult[0] : null
                };
            }

            await conn.commit();

            res.status(200).json({
                message: 'Not Accepted Members Fetched Successfully',
                notAcceptedMembers: notAcceptedMembersResult,
                acceptedMembers: acceptedMembersResult,
                acceptedDetails: acceptedDetailsMap,
                groupDetails: groupDetailsMap
            });
        } else {
            await conn.commit();
            res.status(200).json({
                message: 'No Not Accepted Members Found',
                notAcceptedMembers: [],
                acceptedMembers: [],
                acceptedDetails: {},
                groupDetails: {}
            });
        }
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const acceptOrRejectInnerCircle = async (req, res) => {
    // console.log("reqqqqqqqqqq body", req.body);

    const { groupId, status } = req.body.data;
    const userId = req.user.id;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        await conn.query(`
            UPDATE techcoach_lite.techcoach_group_members 
            SET status = ? 
            WHERE group_id = ? AND member_id = ?
        `, [status, groupId, userId]);

        await conn.commit();

        res.status(200).json({ message: 'Notification status updated successfully' });
    } catch (error) {
        console.error('Error updating notification status:', error);
        await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const getSharedDecisions = async (req, res) => {
    const userId = req.user.id;
    let conn;

    const decryptText = (text, key) => {
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

    const encryptText = (text, key) => {
        try {
            const cipher = crypto.createCipher('aes-256-cbc', key);
            let encryptedText = cipher.update(text, 'utf8', 'hex');
            encryptedText += cipher.final('hex');
            return encryptedText;
        } catch (error) {
            console.error('Error encrypting text:', error);
            return null;
        }
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const sharedDecisionsQuery = `
            SELECT 
                sd.id AS shared_decision_id,
                sd.decisionId,
                sd.groupId,
                sd.groupMember,
                g.id AS group_id, 
                g.type_of_group,
                g.created_by
            FROM techcoach_lite.techcoach_shared_decisions sd
            JOIN techcoach_lite.techcoach_groups g ON sd.groupId = g.id
            WHERE sd.groupMember = ? AND g.type_of_group = 'inner_circle'
        `;

        const sharedDecisions = await conn.query(sharedDecisionsQuery, [userId]);

        if (sharedDecisions.length === 0) {
            res.status(200).json({ message: 'No decisions fetched', results: [], decisionCount: 0 });
            return;
        }

        const decisionIds = sharedDecisions.map(d => d.decisionId);
        const groupIds = sharedDecisions.map(d => d.groupId);

        // Fetch all decisions at once
        const decisionDetailsQuery = await conn.query(`
            SELECT decision_id, user_id, decision_name, decision_reason, created_by, creation_date, 
                   decision_due_date, decision_taken_date, user_statement
            FROM techcoach_lite.techcoach_decision
            WHERE decision_id IN (?)
        `, [decisionIds]);

        // Fetch all users at once
        const userIds = decisionDetailsQuery.map(d => d.user_id);
        const usersQuery = await conn.query(`
            SELECT user_id, displayname, email 
            FROM techcoach_lite.techcoach_users 
            WHERE user_id IN (?)
        `, [userIds]);

        // Fetch all groups at once
        const groupDetailsQuery = await conn.query(`
           SELECT id, created_by 
            FROM techcoach_lite.techcoach_groups 
            WHERE id IN (?) AND type_of_group = 'inner_circle'
        `, [groupIds]);

        const groupUserIds = groupDetailsQuery.map(g => g.created_by);
        const groupUsersQuery = await conn.query(`
            SELECT user_id, displayname, email 
            FROM techcoach_lite.techcoach_users 
            WHERE user_id IN (?)
        `, [groupUserIds]);

        // Build a map for quick lookups
        const userMap = new Map(usersQuery.map(user => [user.user_id, user]));
        const groupMap = new Map(groupDetailsQuery.map(group => [group.id, group]));
        const groupUserMap = new Map(groupUsersQuery.map(user => [user.user_id, user]));

        const results = [];
        let decisionCount = 0;

        for (const sharedDecision of sharedDecisions) {
            const { decisionId, groupId } = sharedDecision;

            const decisionDetails = decisionDetailsQuery.find(d => d.decision_id === decisionId);
            if (!decisionDetails) continue;

            const userDetails = userMap.get(decisionDetails.user_id) || null;
            decisionDetails.userDetails = userDetails;

            const groupDetails = groupMap.get(groupId);
            if (!groupDetails) continue;

            const groupUserDetails = groupUserMap.get(groupDetails.created_by);
            if (!groupUserDetails) continue;

            const keyData = undefined + groupUserDetails.displayname + groupUserDetails.email;
            const encryptedKey = encryptText(keyData, process.env.PUBLIC_KEY);

            decisionDetails.decision_name = decryptText(decisionDetails.decision_name, encryptedKey);
            decisionDetails.user_statement = decryptText(decisionDetails.user_statement, encryptedKey);

            // Fetch decision reasons in one query per decisionId
            const decisionReasonQuery = await conn.query(`
                SELECT decision_reason_text 
                FROM techcoach_lite.techcoach_decision_reason 
                WHERE decision_id = ?
            `, [decisionId]);

            decisionDetails.reasons = decisionReasonQuery.map(reasonEntry =>
                decryptText(reasonEntry.decision_reason_text, encryptedKey)
            );

            // Fetch comments and replies together
            const sharedInfo = await conn.query(`
                SELECT d.id, d.groupId, d.groupMember, d.decisionId, d.comment, d.created_at, d.parentCommentId, d.updated_at,
                       t.user_id, t.displayname, t.email
                FROM techcoach_lite.techcoach_conversations d
                LEFT JOIN techcoach_lite.techcoach_users t ON d.groupMember = t.user_id
                WHERE d.groupId = ? AND d.decisionId = ? AND d.groupMember = ?
            `, [groupId, decisionId, userId]);

            const commentIds = sharedInfo.map(comment => comment.id);
            let replies = [];

            if (commentIds.length > 0) {
                replies = await conn.query(`
                    SELECT d.id, d.groupId, d.groupMember, d.decisionId, d.comment, d.created_at, d.parentCommentId, d.updated_at,
                           t.user_id, t.displayname, t.email
                    FROM techcoach_lite.techcoach_conversations d
                    LEFT JOIN techcoach_lite.techcoach_users t ON d.groupMember = t.user_id
                    WHERE d.parentCommentId IN (?)
                `, [commentIds]);
            }

            sharedInfo.forEach(comment => {
                comment.replies = replies.filter(reply => reply.parentCommentId === comment.id);
            });

            results.push({
                sharedDecision,
                decisionDetails,
                groupDetails,
                groupUserDetails,
                comments: sharedInfo
            });

            decisionCount++;
        }

        await conn.commit();

        res.status(200).json({
            message: decisionCount > 0 ? 'Shared Notification Fetched Successfully' : 'No decisions fetched',
            results,
            decisionCount
        });
    } catch (error) {
        console.error('Error fetching Shared Notification:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


// const getSharedwithDecisionsCount = async (req, res) => {
//     const userId = req.user.id;
//     let conn;

//     try {
//         conn = await getConnection();
//         await conn.beginTransaction();

//         // Optimized query to directly count the shared decisions
//         const [sharedDecisionsCount] = await conn.query(`
//             SELECT COUNT(DISTINCT tsd.id) AS count
//             FROM techcoach_lite.techcoach_shared_decisions tsd
//             JOIN techcoach_lite.techcoach_group_members tgm
//             ON tsd.groupId = tgm.group_id
//             WHERE tgm.member_id = ?
//         `, [userId]);

//         await conn.commit();

//         // Convert BigInt to a regular Number
//         const decisionCount = Number(sharedDecisionsCount.count || 0);

//         if (decisionCount === 0) {
//             res.status(200).json({ message: 'No decisions fetched', decisionCount });
//         } else {
//             res.status(200).json({ message: 'Shared Notification Count Fetched Successfully', decisionCount });
//         }
//     } catch (error) {
//         console.error('Error fetching Shared Notification Count:', error);
//         if (conn) await conn.rollback();
//         res.status(500).json({ error: 'An error occurred while processing your request' });
//     } finally {
//         if (conn) conn.release();
//     }
// };


const getSharedwithDecisionsCount = async (req, res) => {
    const userId = req.user.id;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        // Query for 'inner_circle' shared decisions count (excluding current user)
        const innerCircleQuery = `
            SELECT COUNT(DISTINCT tsd.id) AS count
            FROM techcoach_lite.techcoach_shared_decisions tsd
            JOIN techcoach_lite.techcoach_decision td ON tsd.decisionId = td.decision_id
            JOIN techcoach_lite.techcoach_groups tg ON tsd.groupId = tg.id
            JOIN techcoach_lite.techcoach_group_members tgm ON tg.id = tgm.group_id
            WHERE tgm.member_id = ?
            AND tg.type_of_group = 'inner_circle'
            AND tsd.groupMember = ?
        `;
        const [innerCircleCountResult] = await conn.query(innerCircleQuery, [userId,userId]);
        const innerCircleCount = Number(innerCircleCountResult?.count || 0);

        // Query for 'decision_circle' shared decisions count (excluding current user and excluding decisions shared by the current user)
        const decisionCircleQuery = `
            SELECT COUNT(DISTINCT tsd.id) AS count
            FROM techcoach_lite.techcoach_shared_decisions tsd
            JOIN techcoach_lite.techcoach_decision td ON tsd.decisionId = td.decision_id
            JOIN techcoach_lite.techcoach_groups tg ON tsd.groupId = tg.id
            JOIN techcoach_lite.techcoach_users tu ON td.user_id = tu.user_id
            JOIN techcoach_lite.techcoach_group_members tgm ON tsd.groupId = tgm.group_id
            JOIN techcoach_lite.techcoach_users tmu ON tgm.member_id = tmu.user_id
            WHERE tgm.member_id = ?
            AND tg.type_of_group = 'decision_circle'
            AND tu.user_id != ?
        `;


        // Convert results to numbers
        const [decisionCircleCountResult] = await conn.query(decisionCircleQuery, [userId,userId]);
        const decisionCircleCount = Number(decisionCircleCountResult?.count || 0);

        const decisionCount = innerCircleCount + decisionCircleCount;

        // If no decisions are shared with the user
        if (decisionCount === 0) {
            return res.status(200).json({ message: 'No decisions fetched', decisionCount });
        }

        // Return the count of shared decisions
        return res.status(200).json({ message: 'Shared Notification Count Fetched Successfully', decisionCount });

    } catch (error) {
        console.error('Error fetching Shared Notification Count:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const postCommentForDecision = async (req, res) => {
    // console.log("Request body", req.body);

    const { decisionId, groupMemberID, groupId, commentText } = req.body.data;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const updateCommentResult = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_conversations (groupId, groupMember, comment, created_at, decisionId) 
             VALUES (?, ?, ?, NOW(), ?)`,
            [groupId, groupMemberID, commentText, decisionId]
        );


        await conn.commit();

        res.status(200).json({ message: 'Comment posted and shared decision updated successfully' });
    } catch (error) {
        console.error('Error processing request:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const getComments = async (req, res) => {
    const decisionId = req.query.decisionId;
    let userId = req.user.id;
    let conn;

    try {
        conn = await getConnection();
        const commentsQuery = `
            SELECT 
                d.id,
                d.groupId,
                d.groupMember,
                d.decisionId,
                d.comment,
                d.created_at,
                d.parentCommentId,
                d.updated_at,
                t.user_id,
                t.displayname,
                t.email
            FROM 
                techcoach_lite.techcoach_conversations d
            LEFT JOIN 
                techcoach_lite.techcoach_users t
            ON 
                d.groupMember = t.user_id
            WHERE 
                d.decisionId = ?
        `;

        const comments = await conn.query(commentsQuery, [decisionId]);

        // Map through the comments and add type_of_user property
        const updatedComments = comments.map(comment => ({
            ...comment,
            type_of_user: comment.groupMember === userId ? 'author' : 'member'
        }));

        res.status(200).json({ comments: updatedComments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'An error occurred while fetching comments' });
    } finally {
        if (conn) conn.release();
    }
};


const getSharedComments = async (req, res) => {
    const userId = req.user.id;

    // console.log("request from shared comments fetch", req.body);
    const { decisionId } = req.body;
    let conn;
    try {
        conn = await getConnection();
        const commentsQuery = `SELECT 
            d.id,
            d.groupId,
            d.groupMember,
            d.decisionId,
            d.comment,
            d.created_at,
            d.parentCommentId,
            d.updated_at,
            t.user_id,
            t.displayname,
            t.email,
            g.type_of_group
        FROM 
            techcoach_lite.techcoach_conversations d
        LEFT JOIN 
            techcoach_lite.techcoach_users t ON d.groupMember = t.user_id
        JOIN 
            techcoach_lite.techcoach_groups g ON d.groupId = g.id    
        WHERE 
            d.decisionId = ? AND g.type_of_group='inner_circle'`;

        const comments = await conn.query(commentsQuery, [decisionId]);


        comments.forEach(comment => {
            if (comment.groupMember === userId) {
                comment.type_of_member = 'author';
            } else {
                comment.type_of_member = 'member';
            }
        });

        res.status(200).json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'An error occurred while fetching comments' });
    } finally {
        if (conn) conn.release();
    }
};


const removeCommentsAdded = async (req, res) => {
    // console.log("request from remove", req.body);

    const { commentId } = req.body;

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();
        const query = `
            DELETE FROM techcoach_lite.techcoach_conversations
            WHERE id=?
        `;
        const result = await conn.query(query, [commentId]);


        await conn.commit();
        res.status(200).json({ message: 'Comment removed successfully' });
    } catch (error) {
        console.error('Error in removing comment', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const postReplyComment = async (req, res) => {
    const { commentId, reply, groupId, decisionId } = req.body;

    const userId = req.user.id;

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_conversations (groupId, groupMember, comment, created_at, parentCommentId, decisionId) 
             VALUES (?, ?, ?, NOW(),?, ?)`,
            [groupId, userId, reply, commentId, decisionId]
        );
        await conn.commit();
        res.status(200).json({ message: 'Shared Decision Fetched successfully' });
    } catch (error) {
        console.error('Error in fetching shared decisions', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const editCommentsAdded = async (req, res) => {
    // console.log("reqqqqqqqqqq body editt", req.body);

    const { commentId, editedContent } = req.body.data;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        await conn.query(`
            UPDATE techcoach_lite.techcoach_conversations
            SET comment = ?, updated_at = NOW()
            WHERE id = ?
        `, [editedContent, commentId]);

        await conn.commit();

        res.status(200).json({ message: 'Comments updated successfully' });
    } catch (error) {
        console.error('Error updating Comments:', error);
        await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const innerCirclePostComment = async (req, res) => {
    // console.log("Request body:", req.body.decision);

    const { decision, groupMemberID, commentText, email } = req.body;

    let conn;

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        const firstPart = text.substring(0, 10);
        const lastPart = text.substring(text.length - 10);
        return `${firstPart}...${lastPart}`;
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groupMemberQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?';
        const groupMemberRows = await conn.query(groupMemberQuery, [groupMemberID]);
        const groupMemberDetails = groupMemberRows[0];

        const { decision_name, decision_due_date, creation_date } = decision;

        const truncatedCommentText = truncateText(commentText, 20);

        const htmlBody = `<div style="font-family: Arial, sans-serif; color: #333;">
            <p>Dear ${decision.userDetails.displayname},</p>
            <p>A comment has been posted on the decision titled "<strong>${decision_name}</strong>":</p>
            <p><strong>Creation Date:</strong> ${new Date(creation_date).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(decision_due_date).toLocaleDateString()}</p>
            <p><strong>Comment by ${groupMemberDetails.displayname}:</strong></p>
            <p><em>${truncatedCommentText}</em></p>
            <p>Regards,</p>
            <p>Team @ Decision Coach</p>
        </div>`;

        const emailPayload = {
            from: {
                address: "noreply@ibacustechlabs.live",
                name: "Decision Coach"
            },
            to: [
                {
                    email_address: {
                        address: email,
                        name: "Decision Coach"
                    }
                }
            ],
            subject: "Comment Posted on Your Shared Decision",
            htmlbody: htmlBody
        };

        const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
        const zeptoMailApiKey = process.env.ZEPTO_MAIL_API_KEY;

        await axios.post(zeptoMailApiUrl, emailPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
            }
        });

        await conn.commit();
        res.status(200).json({ message: 'Mail Sent Successfully' });
    } catch (error) {
        console.error('Error in sending mail on Post comment to inner circle:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const innerCircleDecisionShare = async (req, res) => {

    const { memberEmail, decisionSummary } = req.body;
    const memberId = req.user.id;

    let conn;

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        const firstPart = text.substring(0, 10);
        const lastPart = text.substring(text.length - 10);
        return `${firstPart}...${lastPart}`;
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const memberNameQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE email = ?';
        const rows = await conn.query(memberNameQuery, [memberEmail]);

        if (!rows || rows.length === 0) {
            throw new Error('Member not found');
        }

        const memberName = rows[0].displayname;


        const subjectNameQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?';
        const subjectNameRows = await conn.query(subjectNameQuery, [memberId]);



        if (!subjectNameRows || subjectNameRows.length === 0) {
            throw new Error('Member not found');
        }

        const subjectName = subjectNameRows[0].displayname;

        const truncatedDecisionText = truncateText(decisionSummary.decisionName, 20);

        const emailPayload = {
            from: {
                address: "noreply@ibacustechlabs.live",
                name: "Decision Coach"
            },
            to: [
                {
                    email_address: {
                        address: memberEmail,
                        name: memberName
                    }
                }
            ],
            subject: `Help ${subjectName} decide`,
            htmlbody: `<div style="font-family: Arial, sans-serif; color: #333;">
                <p>Dear ${memberName},</p>
                <p>This is to notify that a decision has been shared with you to provide your inputs.</p>
                <p>Please login and add comments. You can choose to notify them by email at the time of posting comment.</p>
                <p>Here are the details of the decision:</p>
                <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
                    <p><strong>Decision Name:</strong> ${truncatedDecisionText}</p>
                    <p><strong>Due Date:</strong> ${decisionSummary.dueDate}</p>
                    <p><strong>Taken Date:</strong> ${decisionSummary.takenDate}</p>
                </div>
                <p style="text-align: center;">
                    <a href="https://decision-coach-app.onrender.com/" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click here to access the application</a>
                </p>
                <p>Regards,</p>
                <p>Team @ Decision Coach</p>
            </div>`
        };

        const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
        const zeptoMailApiKey = process.env.ZEPTO_MAIL_API_KEY;

        await axios.post(zeptoMailApiUrl, emailPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
            }
        });

        await conn.commit();
        res.status(200).json({ message: 'Mail Sent Successfully' });
    } catch (error) {
        console.error('Error in sending mail on invite to inner circle:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const innerCirclePostReply = async (req, res) => {

    let commentId, reply, groupId, decisionId;

    if (typeof req.body.commentId === 'object') {
        commentId = req.body.commentId.commentId;
        reply = req.body.commentId.replyText;
        decisionId = req.body.commentId.id;
        groupId = req.body.groupId ?? req.body.commentId.groupId;

    } else {
        commentId = req.body.commentId;
        reply = req.body.reply;
        groupId = req.body.groupId;
        decisionId = req.body.decisionId;
    }

    if (!commentId || !groupId || !reply || !decisionId) {
        console.error("Missing required fields in request body");
        return res.status(400).json({ error: 'Missing required fields', details: { commentId, groupId, reply, decisionId } });
    }

    const userId = req.user.id;
    let conn;

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        const firstPart = text.substring(0, 10);
        const lastPart = text.substring(text.length - 10);
        return `${firstPart}...${lastPart}`;
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_conversations (groupId, groupMember, comment, created_at, parentCommentId, decisionId) 
             VALUES (?, ?, ?, NOW(), ?, ?)`,
            [groupId, userId, reply, commentId, decisionId]
        );
        console.log("Database insert result:", query);

        await conn.commit();
        const decision = (await conn.query(`SELECT decision_name, creation_date, decision_due_date, user_id FROM techcoach_lite.techcoach_decision WHERE decision_id = ?`, [decisionId]))[0];
        const groupMemberDetails = (await conn.query(`SELECT displayname FROM techcoach_lite.techcoach_users WHERE user_id = ?`, [userId]))[0];
        const originalCommentPoster = (await conn.query(`SELECT email, displayname FROM techcoach_lite.techcoach_users 
            JOIN techcoach_lite.techcoach_conversations 
            ON techcoach_users.user_id = techcoach_conversations.groupMember 
            WHERE techcoach_conversations.id = ?`, [commentId]))[0];

        console.log("Decision data:", decision);
        console.log("Group Member Details:", groupMemberDetails);
        console.log("Decision Owner:", originalCommentPoster);

        const truncatedReplyText = truncateText(reply, 20);
        const htmlBody = `
                          <div style="font-family: Arial, sans-serif; color: #333;">
                           <p>Dear ${originalCommentPoster?.displayname || "User"},</p>
                           <p>A reply has been posted on the decision titled "<strong>${decision?.decision_name || "Decision"}</strong>":</p>
                           <p><strong>Creation Date:</strong> ${new Date(decision?.creation_date).toLocaleDateString()}</p>
                           <p><strong>Due Date:</strong> ${new Date(decision?.decision_due_date).toLocaleDateString()}</p>
                           <p><strong>Reply by ${groupMemberDetails?.displayname || "Anonymous"}:</strong></p>
                           <p><em>${truncatedReplyText}</em></p>
                           <p>Regards,</p>
                           <p>Team @ Decision Coach</p>
                          </div>
                              `;
        const emailPayload = {
            from: { address: "noreply@ibacustechlabs.live",
                name: "Decision Coach" },
            to: [{ email_address: { address: originalCommentPoster?.email, name: originalCommentPoster?.displayname } }],
            subject: "Reply Posted on Your Shared Decision",
            htmlbody: htmlBody
        };

        const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
        const zeptoMailApiKey = process.env.ZEPTO_MAIL_API_KEY;

        await axios.post(zeptoMailApiUrl, emailPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
            }
        });

        res.status(200).json({ message: 'Reply posted successfully' });
    } catch (error) {
        console.error('Error in posting reply', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while posting your reply' });
    } finally {
        if (conn) conn.release();
    }
};


const innerCircleInvitation = async (req, res) => {
    const { email, groupId } = req.body;
    const { id: senderId, email: senderEmail } = req.user;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        let userQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE email = ?';
        let [existingUser] = await conn.query(userQuery, [email]);

        if (!existingUser) {
            return res.status(404).json({ error: 'User is not in the application. Please ask them to sign up first.' });
        }

        const invitedUserId = existingUser.user_id;
        const addMemberQuery = `
            INSERT INTO techcoach_lite.techcoach_group_members (group_id, member_id, status)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE status=status`;
        await conn.query(addMemberQuery, [groupId, invitedUserId, '']);

        const senderDetailsQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?';
        const [senderDetails] = await conn.query(senderDetailsQuery, [senderId]);

        const emailPayload = {
            from: { address: "noreply@ibacustechlabs.live",
                name: "Decision Coach" },
            to: [{ email_address: { address: email, name: "Decision Coach" } }],
            subject: `Join ${senderDetails.displayname}'s Inner Circle`,
            htmlbody: `<div style="font-family: Arial, sans-serif; color: #333;">
                <p>Hi ,</p>
                <p>${senderDetails.displayname} wants to add you as a member of their inner circle in the Decision Coach app.</p>
                <p>Please join the Decision Coach application and provide your inputs on decisions.</p>
                <p style="text-align: center;">
                    <a href="https://decision-coach-app.onrender.com/" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click here to access the application</a>
                </p>
                <p>Regards,</p>
                <p>Team @ Decision Coach</p>
            </div>`
        };

        const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
        const zeptoMailApiKey = process.env.ZEPTO_MAIL_API_KEY;

        await axios.post(zeptoMailApiUrl, emailPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
            }
        });

        await conn.commit();
        res.status(200).json({ message: 'Mail Sent Successfully' });
    } catch (error) {
        console.error('Error in sending mail on invite to inner circle:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const innerCircleAddInvitation = async (req, res) => {
    // console.log("Request body invitation:", req.user);
    // console.log("Request body invitation:", req.body);

    const { email } = req.body;
    const { email: senderEmail } = req.user;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groupMemberQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE email = ?';
        const groupMemberRows = await conn.query(groupMemberQuery, [senderEmail]);
        const groupMemberDetails = groupMemberRows[0];

        const emailPayload = {
            from: {
                address: "noreply@ibacustechlabs.live",
                name: "Decision Coach"
            },
            to: [
                {
                    email_address: {
                        address: email,
                        name: "Decision Coach"
                    }
                }
            ],
            subject: `You are invited to an Inner Circle`,
            htmlbody: `<div style="font-family: Arial, sans-serif; color: #333;">
                <p>Hi,</p>
                <p>You are receiving this notification as is inviting you to become part of their inner circle.</p>
                <p>Decision Coach application enables confidential collaboration between people who trust each other to support in making important decisions.</p>
                <p>Accessing Decision Coach is simple. Use this Google email account to sign up and you are all set. And it is free.</p>
                <p>If you are already a user of Decision Coach then just sign in.</p>
                <p style="text-align: center;">
                    <a href="https://decision-coach-app.onrender.com/" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click here to access the application</a>
                </p>
                <p style="text-align: center;">
                    <a href="https://decision-coach-app.onrender.com/" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click Inner Circle to accept the invite</a>
                </p>
                <p>Regards,</p>
                <p>Team @ Decision Coach</p>
            </div>`
        };

        const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
        const zeptoMailApiKey = process.env.ZEPTO_MAIL_API_KEY;

        await axios.post(zeptoMailApiUrl, emailPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
            }
        });

        await conn.commit();
        res.status(200).json({ message: 'Mail Sent Successfully' });
    } catch (error) {
        console.error('Error in sending mail on invite to inner circle:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const getSharedDecisionDetails = async (req, res) => {
    const { id } = req.user;
    let conn;

    const decryptText = (text, key) => {
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

    const encryptText = (text, key) => {
        try {
            const cipher = crypto.createCipher('aes-256-cbc', key);
            let encryptedText = cipher.update(text, 'utf8', 'hex');
            encryptedText += cipher.final('hex');
            return encryptedText;
        } catch (error) {
            console.error('Error encrypting text:', error);
            return null;
        }
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groups = await conn.query(
            `SELECT id, type_of_group FROM techcoach_lite.techcoach_groups 
             WHERE created_by = ? AND type_of_group = 'inner_circle'`,
            [id]
        );

        if (groups.length === 0) {
            await conn.commit();
            return res.status(200).json({ message: 'No groups found for this user' });
        }

        const groupIds = groups.map(group => group.id);

        const sharedDecisions = await conn.query(
            `SELECT sd.*, g.type_of_group 
             FROM techcoach_lite.techcoach_shared_decisions sd
             JOIN techcoach_lite.techcoach_groups g ON sd.groupId = g.id
             WHERE sd.groupId IN (?) AND g.type_of_group = 'inner_circle'`,
            [groupIds]
        );

        if (sharedDecisions.length === 0) {
            await conn.commit();
            return res.status(200).json({ message: 'No shared decisions found for these groups' });
        }

        const groupMembers = sharedDecisions.map(sd => sd.groupMember);
        const decisionIds = sharedDecisions.map(sd => sd.decisionId);

        const tasks = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_users WHERE user_id IN (?)`,
            [groupMembers]
        );

        const currentUser = (await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?`,
            [id]
        ))[0];

        // console.log("ssssssssssssss", currentUser);

        const decisions = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_decision WHERE decision_id IN (?)`,
            [decisionIds]
        );

        const keyData = undefined + currentUser.displayname + currentUser.email;
        const encryptedKey = encryptText(keyData, process.env.PUBLIC_KEY);

        // Decrypt decision details
        decisions.forEach(decision => {
            decision.decision_name = decryptText(decision.decision_name, encryptedKey);
            decision.user_statement = decryptText(decision.user_statement, encryptedKey);
        });

        // Fetch and link tag information
        const decisionTags = await conn.query(
            `SELECT dt.decision_id, t.tag_name, t.tag_type 
             FROM techcoach_lite.techcoach_decision_tag_linked_info dt
             JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
             WHERE dt.decision_id IN (?)`,
            [decisionIds]
        );

        decisions.forEach(decision => {
            decision.tags = decisionTags
                .filter(tag => tag.decision_id === decision.decision_id)
                .map(tag => ({ tag_name: tag.tag_name, tag_type: tag.tag_type }));
        });

        await conn.commit();
        res.status(200).json({ sharedDecisions, tasks, decisions });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error in fetching shared decision details', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

// const getSharedByDecisionsCount = async (req, res) => {
//     const userId = req.user.id;
//     let conn;
//     try {
//         conn = await getConnection();

//         // No need for transactions here since we're doing a read-only query
//         const [SharedByDecisionsCount] = await conn.query(`
//             SELECT COUNT(DISTINCT tsd.id) AS count
//             FROM techcoach_lite.techcoach_shared_decisions tsd
//             JOIN techcoach_lite.techcoach_groups tg
//                 ON tsd.groupId = tg.id
//             WHERE tg.created_by = ? 
//         `, [userId]);

//         const decisionCount = Number(SharedByDecisionsCount.count);

//         // If no decisions are shared by the user
//         if (decisionCount === 0) {
//             return res.status(200).json({ message: 'No decisions fetched', decisionCount });
//         }

//         // Return the count of shared decisions
//         return res.status(200).json({ message: 'Shared Notification Count Fetched Successfully', decisionCount });

//     } catch (error) {
//         console.error('Error fetching shared Notification Count:', error);
//         res.status(500).json({ error: 'An error occurred while processing your request' });
//     } finally {
//         if (conn) conn.release();
//     }
// }


const getSharedByDecisionsCount = async (req, res) => {
    const userId = req.user.id;
    let conn;
    try {
        conn = await getConnection();

        // Query for 'inner_circle'
        const innerCircleQuery = `
            SELECT COUNT(DISTINCT tsd.id) AS count
            FROM techcoach_lite.techcoach_shared_decisions tsd
            JOIN techcoach_lite.techcoach_groups tg ON tsd.groupId = tg.id
            WHERE tg.created_by = ? AND tg.type_of_group = 'inner_circle';
        `;
        const [innerCircleCountResult] = await conn.query(innerCircleQuery, [userId]);
        const innerCircleCount = Number(innerCircleCountResult?.count || 0);

        // Query for 'decision_circle'
        const decisionCircleQuery = `
            SELECT COUNT(DISTINCT tsd.id) AS count
            FROM techcoach_lite.techcoach_shared_decisions tsd
            JOIN techcoach_lite.techcoach_decision td ON tsd.decisionId = td.decision_id
            JOIN techcoach_lite.techcoach_groups tg ON tsd.groupId = tg.id
            JOIN techcoach_lite.techcoach_users tu ON td.user_id = tu.user_id
            JOIN techcoach_lite.techcoach_group_members tgm ON tsd.groupId = tgm.group_id
            JOIN techcoach_lite.techcoach_users tmu ON tgm.member_id = tmu.user_id
            WHERE tu.user_id = ? AND tg.type_of_group = 'decision_circle';
        `;
        const [decisionCircleCountResult] = await conn.query(decisionCircleQuery, [userId]);
        const decisionCircleCount = Number(decisionCircleCountResult?.count || 0);

        // Calculate total shared decisions count
        const decisionCount = innerCircleCount + decisionCircleCount;

        // Handle case where no shared decisions are found
        if (decisionCount === 0) {
            return res.status(200).json({ message: 'No decisions fetched', decisionCount });
        }

        // Return the count of shared decisions
        return res.status(200).json({ message: 'Shared Notification Count Fetched Successfully', decisionCount });

    } catch (error) {
        console.error('Error fetching shared Notification Count:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


module.exports = {
    getUserList,
    innerCircleCreation,
    checkInnerCircleExists,
    getInnerCircleDetails,
    removeMemberFromInner,
    getAddMemberNameList,
    addMemberInInnerCircle,
    shareDecisionInInnerCircle,
    getSharedMembers,
    getInnerCircleAcceptNotification,
    acceptOrRejectInnerCircle,
    getSharedDecisions,
    postCommentForDecision,
    getComments,
    getSharedComments,
    removeCommentsAdded,
    postReplyComment,
    editCommentsAdded,
    innerCirclePostComment,
    innerCircleDecisionShare,
    innerCirclePostReply,
    innerCircleInvitation,
    innerCircleAddInvitation,
    getSharedDecisionDetails,
    getSharedwithDecisionsCount,
    getSharedByDecisionsCount
};