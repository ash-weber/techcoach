const getConnection = require('../Models/database');
const crypto = require('crypto');
const axios = require('axios');

const getUserList = async (req, res) => {
    let conn;
    try {

        const userId = req.user.id;
        // console.log("user id from get user list", userId);
        conn = await getConnection();
        await conn.beginTransaction();

        const tasks = await conn.query(`
      SELECT * FROM techcoach_lite.techcoach_users WHERE user_id != ?;
    `, [userId]);

        await conn.commit();
        res.status(200).json({ message: 'User List Fetched successfully', tasks });
    } catch (error) {
        console.error('Error inserting data:', error);
        if (conn)
            await conn.rollback();

        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const decisionCircleCreation = async (req, res) => {
    const { created_by, type_of_group = 'decision_circle', group_name, members } = req.body;
  
    let conn;
    
    try {
      conn = await getConnection();
      await conn.beginTransaction();
  
      const existingGroup = await conn.query(
        `SELECT id FROM techcoach_lite.techcoach_groups WHERE group_name = ? AND created_by =?`,
        [group_name,created_by]
      );
  
      let groupId;
      if (existingGroup.length > 0) {
        groupId = existingGroup[0].id;
      } else {
        const groupResult = await conn.query(
          `INSERT INTO techcoach_lite.techcoach_groups (created_by, type_of_group, group_name) VALUES (?, ?, ?)`,
          [created_by, type_of_group, group_name]
        );
        groupId = groupResult.insertId;
      }
  
      if (!groupId) {
        throw new Error('Group ID is missing after creation/check');
      }
  
      const values = members.map(() => "(?, ?, ?)").join(", ");
      const parameters = members.flatMap(memberId => [groupId, memberId, 'accepted']);
  
      await conn.query(
        `INSERT INTO techcoach_lite.techcoach_group_members (group_id, member_id, status) VALUES ${values}`,
        parameters
      );
  
      await conn.commit();
      res.status(201).json({ message: 'Decision circle created successfully', groupId: groupId.toString() });
    } catch (error) {
      console.error('Error creating decision circle:', error);
      if (conn) await conn.rollback();
      res.status(500).json({ error: 'An error occurred while creating the decision circle' });
    } finally {
      if (conn) conn.release();
    }
};
  
const getUserDecisionCircles = async (req, res) => {
    const created_by = req.user.id;

    let conn;

    try {
        conn = await getConnection();
        const circles = await conn.query(
            `SELECT
             g.group_name,
             g.id,
             u.displayname AS created_by
             FROM techcoach_lite.techcoach_groups g
             JOIN techcoach_lite.techcoach_users u ON g.created_by = u.user_id
             JOIN techcoach_lite.techcoach_group_members m ON g.id = m.group_id
             WHERE m.member_id = ? AND g.type_of_group = 'decision_circle' `,
            [created_by]
        );

        res.status(200).json({ decisionCircles: circles });
    } catch (error) {
        console.error('Error fetching user decision circles:', error);
        res.status(500).json({ error: 'An error occurred while fetching decision circles.' });
    } finally {
        if (conn) conn.release();
    }
};

// const getdecisionCircle = async (req, res) => {
//     const { group_id } = req.params;

//     if (!group_id) {
//         return res.status(400).json({ error: 'Group ID is required.' });
//     }

//     let conn;

//     try {
//         conn = await getConnection();

//         const decisionCircle = await conn.query(
//             `SELECT 
//     g.id AS group_id, 
//     g.group_name, 
//     g.type_of_group, 
//     g.created_at, 
//     g.created_by AS group_creator_id, 
//     creator.displayname AS creator_displayname,  -- Creator's display name
//     creator.email AS creator_email,              -- Creator's email
//     m.member_id, 
//     u.displayname AS member_displayname,         -- Member's display name
//     m.status
// FROM 
//     techcoach_lite.techcoach_groups g
// JOIN 
//     techcoach_lite.techcoach_users creator ON g.created_by = creator.user_id  -- Join to get group creator details
// JOIN 
//     techcoach_lite.techcoach_group_members m ON g.id = m.group_id
// JOIN 
//     techcoach_lite.techcoach_users u ON m.member_id = u.user_id  -- Join to get group members' details
// WHERE 
//     g.id = ?;
// `,
//             [group_id]
//         );

//         if (decisionCircle.length === 0) {
//             return res.status(404).json({ error: 'Decision circle not found.' });
//         }

//         res.status(200).json({ decisionCircle });
//     } catch (error) {
//         console.error('Error fetching decision circle:', error.message);
//         res.status(500).json({ error: 'An error occurred while fetching the decision circle.' });
//     } finally {
//         if (conn) conn.release();
//     }
// };

const getdecisionCirclesByUser = async (req, res) => {
    const user_id = req.user.id;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    let conn;

    try {
        conn = await getConnection();

        const decisionCircles = await conn.query(
            `SELECT 
                g.id AS group_id, 
                g.group_name, 
                g.type_of_group, 
                g.created_at, 
                g.created_by AS group_creator_id, 
                creator.displayname AS creator_displayname,  -- Creator's display name
                creator.email AS creator_email,              -- Creator's email
                m.member_id, 
                u.displayname AS member_displayname,         -- Member's display name
                m.status
            FROM 
                techcoach_lite.techcoach_groups g
            JOIN 
                techcoach_lite.techcoach_users creator ON g.created_by = creator.user_id  -- Join to get group creator details
            JOIN 
                techcoach_lite.techcoach_group_members m ON g.id = m.group_id
            JOIN 
                techcoach_lite.techcoach_users u ON m.member_id = u.user_id  -- Join to get group members' details
            WHERE 
                g.created_by = ? AND g.type_of_group = 'decision_circle' ;`,
            [user_id]
        );

        if (decisionCircles.length === 0) {
            return res.status(404).json({ error: 'No decision circles found for this user.' });
        }

        res.status(200).json({ decisionCircles });
    } catch (error) {
        console.error('Error fetching decision circles:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching the decision circles.' });
    } finally {
        if (conn) conn.release();
    }
};

const getdecisionCirclesByUserAndMember = async (req, res) => {
    const user_id = req.user.id;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    let conn;

    try {
        conn = await getConnection();

        const groups = await conn.query(
            `SELECT 
                g.id AS group_id, 
                g.group_name, 
                g.type_of_group, 
                g.created_at, 
                g.created_by AS group_creator_id, 
                creator.displayname AS creator_displayname,  -- Creator's display name
                creator.email AS creator_email,              -- Creator's email
                m.member_id, 
                u.displayname AS member_displayname,         -- Member's display name
                m.status
            FROM 
                techcoach_lite.techcoach_groups g
            LEFT JOIN 
                techcoach_lite.techcoach_users creator ON g.created_by = creator.user_id  -- Join to get group creator details
            LEFT JOIN 
                techcoach_lite.techcoach_group_members m ON g.id = m.group_id  -- Include members
            LEFT JOIN 
                techcoach_lite.techcoach_users u ON m.member_id = u.user_id  -- Join to get group members' details
            WHERE 
                (g.created_by = ? OR m.member_id = ?)
                 AND g.type_of_group = 'decision_circle' `,
            [user_id, user_id]
        );

        if (groups.length === 0) {
            return res.status(404).json({ error: 'No decision circles found for this user.' });
        }

        res.status(200).json({ groups });
    } catch (error) {
        console.error('Error fetching decision circles:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching the decision circles.' });
    } finally {
        if (conn) conn.release();
    }
};

// const getAllGroups = async (req, res) => {
//     let conn;

//     try {
//         conn = await getConnection();
//         await conn.beginTransaction();

//         // Query to get all groups
//         const groupQuery = `
//             SELECT id, group_name
//             FROM techcoach_lite.techcoach_groups
//             WHERE created_by = ?  
//         `;

//         const groupResult = await conn.query(groupQuery, [req.user.id]);

//         await conn.commit();
//         res.status(200).json(groupResult);
//     } catch (error) {
//         console.error('Error fetching all groups:', error.message);
//         if (conn) {
//             await conn.rollback();
//         }
//         res.status(500).json({ error: 'An error occurred while fetching group details' });
//     } finally {
//         if (conn) conn.release();
//     }
// };

const getUsersForGroup = async (req, res) => {
    const { groupId } = req.params;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        // Query to get group details
        const groupQuery = `
            SELECT 
                tg.id, 
                tg.group_name, 
                tg.created_by, 
                tu.displayname AS created_by_name, 
                tu.email AS created_by_email
            FROM techcoach_lite.techcoach_groups tg
            LEFT JOIN techcoach_lite.techcoach_users tu ON tg.created_by = tu.user_id
            WHERE tg.id = ?
        `;

        const groupResult = await conn.query(groupQuery, [groupId]);

        if (groupResult.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Query to get members of the group
        const membersQuery = `
            SELECT techcoach_lite.techcoach_users.user_id, techcoach_lite.techcoach_users.displayname, techcoach_lite.techcoach_users.email, techcoach_lite.techcoach_group_members.status
            FROM techcoach_lite.techcoach_group_members
            JOIN techcoach_lite.techcoach_users ON techcoach_lite.techcoach_group_members.member_id = techcoach_lite.techcoach_users.user_id
            WHERE techcoach_lite.techcoach_group_members.group_id = ?
        `;

        const membersResult = await conn.query(membersQuery, [groupId]);

        await conn.commit();
        res.status(200).json({ group: groupResult, members: membersResult });
    } catch (error) {
        console.error('Error fetching users for the group', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while fetching group details' });
    } finally {
        if (conn) conn.release();
    }
};

const removeUsersFromGroup = async (req, res) => {
    const { groupId, userId } = req.params;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groupQuery = `
            SELECT id
            FROM techcoach_lite.techcoach_groups
            WHERE id = ?
        `;
        const groupResult = await conn.query(groupQuery, [groupId]);

        if (groupResult.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const memberCheckQuery = `
            SELECT member_id
            FROM techcoach_lite.techcoach_group_members
            WHERE group_id = ? AND member_id = ?
        `;
        const memberCheckResult = await conn.query(memberCheckQuery, [groupId, userId]);

        if (memberCheckResult.length === 0) {
            return res.status(404).json({ error: 'User is not a member of the group' });
        }

        const removeMemberQuery = `
            DELETE FROM techcoach_lite.techcoach_group_members
            WHERE group_id = ? AND member_id = ?
        `;
        await conn.query(removeMemberQuery, [groupId, userId]);

        await conn.commit();
        res.status(200).json({ message: 'User removed from the group successfully' });
    } catch (error) {
        console.error('Error removing user from the group', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while removing the user from the group' });
    } finally {
        if (conn) conn.release();
    }
};

const getGroupDetails = async (req, res) => {
    const groupId = req.params.groupId; 
    let conn;

    try {
        conn = await getConnection(); 
        await conn.beginTransaction(); 

        const query = `
            SELECT 
                g.group_name,
                g.id,
                g.created_at,
                u.displayname AS created_by,
                u.email AS creator_email
            FROM 
                techcoach_lite.techcoach_groups g
            JOIN 
                techcoach_lite.techcoach_users u ON g.created_by = u.user_id
            WHERE 
                g.type_of_group = 'decision_circle' AND 
                g.id = ?
        `;

        const [rows] = await conn.execute(query, [groupId]); 

        await conn.commit(); 
        res.status(200).json(rows);
    } catch (error) {
        if (conn) {
            await conn.rollback(); 
        }
        console.error('Error fetching group details:', error);
        res.status(500).json({ error: 'An error occurred while fetching group details.' });
    } finally {
        if (conn) {
            await conn.release();
        }
    }
};

const sendDecisionCircleInvitation = async (req, res) => {
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
            subject: `You are invited to an Decision Circle`,
            htmlbody: `<div style="font-family: Arial, sans-serif; color: #333;">
                <p>Hi,</p>
                <p>You are receiving this notification as is inviting you to become part of their decision circle.</p>
                <p>Decision Coach application enables confidential collaboration between people who trust each other to support in making important decisions.</p>
                <p>Accessing Decision Coach is simple. Use this Google email account to sign up and you are all set. And it is free.</p>
                <p>If you are already a user of Decision Coach then just sign in.</p>
                <p style="text-align: center;">
                    <a href="https://decision-coach-app.onrender.com/" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click here to access the application</a>
                </p>
                <p style="text-align: center;">
                    <a href="https://decision-coach-app.onrender.com/" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click Decision Circle to accept the invite</a>
                </p>
                <p>Regards,</p>
                <p>Team @ Decision Coach</p>
            </div>`
        };

        const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
        const zeptoMailApiKey = process.env.ZEPTO_MAIL_API_KEY

        await axios.post(zeptoMailApiUrl, emailPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
            }
        });

        await conn.commit();
        res.status(200).json({ message: 'Mail Sent Successfully' });
    } catch (error) {
        console.error('Error in sending mail on invite to decision circle:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const decisionshareDecisionCircle = async (req, res) => {
    const { group_id, decision_id } = req.body;

    if (!group_id || !decision_id) {
        return res.status(400).json({ error: 'group_id and decision_id are required' });
    }

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = `INSERT INTO techcoach_lite.techcoach_shared_decisions (groupId,decisionId) VALUES (?,  ?)`;

        // Execute the query
        const result = await conn.query(query, [group_id, decision_id]);


        // Commit the transaction to save changes
        await conn.commit();

        // Send success response
        res.status(200).json({
            message: 'Decision Shared Successfully',
            sharedDecision: {
                group_id,
                decision_id
            },
        });
    } catch (error) {
        console.error('Error Sharing Decision:', error);

        // Rollback the transaction if there's an error
        if (conn) await conn.rollback();

        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // Release the connection back to the pool
        if (conn) await conn.release();
    }
};

// const getdecisionSharedDecisionCircle = async (req, res) => {
//     const userId = req.user.id;
//     const { groupId } = req.params;
//     let conn;
//     // console.log('User ID:', userId); 
//     // console.log('Group ID:', groupId);

//     const decryptText = (text, key) => {
//         if (!text) return text;
//         try {
//             const decipher = crypto.createDecipher('aes-256-cbc', key);
//             let decryptedText = decipher.update(text, 'hex', 'utf8');
//             decryptedText += decipher.final('utf8');
//             return decryptedText;
//         } catch (error) {
//             console.error('Error decrypting text:', error);
//             return null;
//         }
//     };

//     try {
//         conn = await getConnection();

//         const sharedDecisionsQuery = `
//         SELECT 
//           tsd.decisionId AS decision_id,
//           td.decision_name,
//           td.user_statement,
//           td.decision_taken_date,
//           td.decision_due_date,
//           tg.group_name,
//           tg.type_of_group,
//           tu.displayname AS shared_by,
//           tu.email AS shared_by_email
//         FROM techcoach_lite.techcoach_shared_decisions tsd
//         JOIN techcoach_lite.techcoach_decision td ON tsd.decisionId = td.decision_id
//         JOIN techcoach_lite.techcoach_groups tg ON tsd.groupId = tg.id
//         JOIN techcoach_lite.techcoach_users tu ON td.user_id = tu.user_id
//         WHERE tg.created_by = ? AND tg.id = ? AND tg.type_of_group = 'decision_circle'
//       `;

//         const sharedDecisions = await conn.query(sharedDecisionsQuery, [userId, groupId]);
//         // console.log('Shared Decisions Query Result:', sharedDecisions);


//         if (!Array.isArray(sharedDecisions)) {
//             res.status(500).json({ error: 'Unexpected data format: sharedDecisions is not an array' });
//             return;
//         }

//         if (sharedDecisions.length === 0) {
//             res.status(200).json({ message: 'No shared decisions found', decisionCount: 0 });
//             return;
//         }

//         // Decrypt decision_name and user_statement for each decision
//         const decryptedDecisionData = await Promise.all(sharedDecisions.map(async (decision) => {
//             const decryptedDecisionName = decryptText(decision.decision_name, req.user.key);
//             const decryptedUserStatement = decryptText(decision.user_statement, req.user.key);
//             // console.log('Decrypted Decision Name:', decryptedDecisionName); // Log decryption result
//             // console.log('Decrypted User Statement:', decryptedUserStatement);

//             // Fetch decision reasons for each decision
//             const decisionReasons = await conn.query(`
//           SELECT decision_reason_text 
//           FROM techcoach_lite.techcoach_decision_reason 
//           WHERE decision_id = ?
//         `, [decision.decision_id]);

//             // Decrypt each decision reason
//             const decryptedReasons = decisionReasons.map(reason => decryptText(reason.decision_reason_text, req.user.key));

//             return {
//                 ...decision,
//                 decision_name: decryptedDecisionName,
//                 user_statement: decryptedUserStatement,
//                 decision_reason: decryptedReasons
//             };
//         }));

//         const decisionIds = decryptedDecisionData.map(decision => decision.decision_id);

//         const decisionTags = await conn.query(
//             `SELECT dt.decision_id, t.tag_name, t.tag_type 
//              FROM techcoach_lite.techcoach_decision_tag_linked_info dt
//              JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
//              WHERE dt.decision_id IN (?)`,
//             [decisionIds]
//         );

//         // Attach tags to corresponding decisions
//         decryptedDecisionData.forEach(decision => {
//             decision.tags = decisionTags
//                 .filter(tag => tag.decision_id === decision.decision_id)
//                 .map(tag => ({ tag_name: tag.tag_name, tag_type: tag.tag_type }));
//         });


//         // Return the results
//         res.status(200).json({
//             message: 'Shared Decisions Fetched Successfully',
//             results: decryptedDecisionData,
//             decisionCount: decryptedDecisionData.length
//         });

//     } catch (error) {
//         console.error('Error fetching shared decisions:', error);
//         if (conn) await conn.rollback();
//         res.status(500).json({ error: 'An error occurred while fetching shared decisions' });
//     } finally {
//         if (conn) conn.release();
//     }
// };

const getdecisionSharedDecisionCircle = async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;
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

        const sharedDecisionsQuery = `
        SELECT 
          tsd.decisionId AS decision_id,
          td.decision_name,
          td.user_statement,
          td.decision_taken_date,
          td.decision_due_date,
          tg.group_name,
          tg.type_of_group,
          tu.displayname AS shared_by,
          tu.email AS shared_by_email
        FROM techcoach_lite.techcoach_shared_decisions tsd
        JOIN techcoach_lite.techcoach_decision td ON tsd.decisionId = td.decision_id
        JOIN techcoach_lite.techcoach_groups tg ON tsd.groupId = tg.id
        JOIN techcoach_lite.techcoach_users tu ON td.user_id = tu.user_id
        WHERE tg.created_by = ? AND tg.id = ? AND tg.type_of_group = 'decision_circle'
        `;

        const sharedDecisions = await conn.query(sharedDecisionsQuery, [userId, groupId]);

        if (!Array.isArray(sharedDecisions)) {
            res.status(500).json({ error: 'Unexpected data format: sharedDecisions is not an array' });
            return;
        }

        if (sharedDecisions.length === 0) {
            res.status(200).json({ message: 'No shared decisions found', decisionCount: 0 });
            return;
        }

        const decisionIds = sharedDecisions.map(sd => sd.decision_id);

        for (const decision of sharedDecisions) {
            const { decision_id, shared_by, shared_by_email } = decision;

            const keyData = undefined + shared_by + shared_by_email; // Adjust keyData as needed
            const encryptedKey = encryptText(keyData, process.env.PUBLIC_KEY);

            decision.decision_name = decryptText(decision.decision_name, encryptedKey);
            decision.user_statement = decryptText(decision.user_statement, encryptedKey);

            const decisionReasonQuery = `
                SELECT decision_reason_text 
                FROM techcoach_lite.techcoach_decision_reason 
                WHERE decision_id = ?`;

            const decisionReasons = await conn.query(decisionReasonQuery, [decision_id]);

            decision.reasons = decisionReasons.map(reason =>
                decryptText(reason.decision_reason_text, encryptedKey)
            );
        }

        const decisionTags = await conn.query(
            `SELECT dt.decision_id, t.tag_name, t.tag_type 
             FROM techcoach_lite.techcoach_decision_tag_linked_info dt
             JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
             WHERE dt.decision_id IN (?)`,
            [decisionIds]
        );

        sharedDecisions.forEach(decision => {
            decision.tags = decisionTags
                .filter(tag => tag.decision_id === decision.decision_id)
                .map(tag => ({ tag_name: tag.tag_name, tag_type: tag.tag_type }));
        });

        res.status(200).json({
            message: 'Shared Decisions Fetched Successfully',
            results: sharedDecisions,
            decisionCount: sharedDecisions.length
        });

    } catch (error) {
        console.error('Error fetching shared decisions:', error);
        res.status(500).json({ error: 'An error occurred while fetching shared decisions' });
    } finally {
        if (conn) conn.release();
    }
};


const getMemberSharedDecisions = async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;
    let conn;

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

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        // Fetch decisions shared with the group
        const decisionQuery = `
            SELECT 
              tsd.decisionId AS decision_id,
              td.decision_name,
              td.user_statement,
              td.decision_taken_date,
              td.decision_due_date,
              tg.group_name,
              tg.type_of_group,
              tu.displayname AS shared_by,
              tu.email AS shared_by_email
            FROM techcoach_lite.techcoach_shared_decisions tsd
            JOIN techcoach_lite.techcoach_decision td ON tsd.decisionId = td.decision_id
            JOIN techcoach_lite.techcoach_groups tg ON tsd.groupId = tg.id
            JOIN techcoach_lite.techcoach_users tu ON td.user_id = tu.user_id
            WHERE tg.id = ? AND tg.type_of_group='decision_circle'`;

        const getDecisions = await conn.query(decisionQuery, [groupId]);

        if (!Array.isArray(getDecisions) || !getDecisions.length) {
            return res.status(200).json({
                message: 'No decisions found',
                results: [],
                decisionCount: 0
            });
        }

        const decisionDetailsMap = new Map();

        for (const decision of getDecisions) {
            const { decision_id, shared_by, shared_by_email } = decision;

            // ✅ CORRECT KEY (same as encryption)
            const key = `${shared_by}${shared_by_email}`;

            // ✅ Decrypt main fields
            decision.decision_name = decryptText(decision.decision_name, key);
            decision.user_statement = decryptText(decision.user_statement, key);

            // Fetch decision reasons
            const decisionReasons = await conn.query(
                `SELECT decision_reason_text 
                 FROM techcoach_lite.techcoach_decision_reason 
                 WHERE decision_id = ?`,
                [decision_id]
            );

            // ✅ Decrypt reasons
            decision.reasons = decisionReasons.map(reason =>
                decryptText(reason.decision_reason_text, key)
            );

            decisionDetailsMap.set(decision_id, decision);
        }

        // Fetch tags
        const decisionIds = [...decisionDetailsMap.keys()];

        if (decisionIds.length > 0) {
            const decisionTags = await conn.query(
                `SELECT dt.decision_id, t.tag_name, t.tag_type 
                 FROM techcoach_lite.techcoach_decision_tag_linked_info dt
                 JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
                 WHERE dt.decision_id IN (?)`,
                [decisionIds]
            );

            decisionTags.forEach(tag => {
                const decision = decisionDetailsMap.get(tag.decision_id);
                if (decision) {
                    if (!decision.tags) decision.tags = [];
                    decision.tags.push({
                        tag_name: tag.tag_name,
                        tag_type: tag.tag_type
                    });
                }
            });
        }

        const decryptedResults = [...decisionDetailsMap.values()];

        await conn.commit();

        res.status(200).json({
            message: 'Group members and decisions fetched successfully',
            results: decryptedResults,
            decisionCount: decryptedResults.length
        });

    } catch (error) {
        console.error('Error fetching group members with decisions:', error);
        if (conn) await conn.rollback();
        res.status(500).json({
            error: 'An error occurred while fetching group members and decisions'
        });
    } finally {
        if (conn) conn.release();
    }
};

const decisionCirclePostComment = async (req, res) => {
    const { decisionId, groupId, comment, email } = req.body;
    let conn;

    const truncateText = (text, maxLength) => {
        if (!text || text.length <= maxLength) return text;
        const firstPart = text.substring(0, maxLength / 2);
        const lastPart = text.substring(text.length - maxLength / 2);
        return `${firstPart}...${lastPart}`;
    };

    try {
        // Database connection
        conn = await getConnection();
        await conn.beginTransaction();

        // Validate input
        if (!decisionId || !groupId || !comment) {
            throw new Error("Invalid input: Missing required fields");
        }

        // Fetch the poster's displayname
        const posterQuery = `
            SELECT displayname
            FROM techcoach_lite.techcoach_users
            WHERE user_id = ?
        `;
        const posterDetails = await conn.query(posterQuery, [req.user.id]);

        if (!posterDetails || posterDetails.length === 0) {
            throw new Error("Poster details not found");
        }

        const posterDisplayName = posterDetails[0].displayname;

        // Fetch the shared decision details for the given groupId and decisionId
        const groupMemberQuery = `
            SELECT 
                u.user_id, 
                u.displayname AS member_name, 
                u.email AS member_email,
                op.displayname AS original_poster_name, 
                op.email AS original_poster_email
            FROM techcoach_lite.techcoach_group_members gm
            JOIN techcoach_lite.techcoach_users u ON gm.member_id = u.user_id
            LEFT JOIN techcoach_lite.techcoach_users op ON op.user_id = gm.member_id
            WHERE gm.group_id = ?
        `;

        const groupMemberDetails = await conn.query(groupMemberQuery, [groupId]);

        if (!Array.isArray(groupMemberDetails) || groupMemberDetails.length === 0) {
            throw new Error("No group members found for the provided group and decision");
        }

        // Get the user ID of the poster (the one who posted the comment)
        const posterId = req.user.id; // Assuming `req.user.id` is the poster's user ID

        // Filter out the poster from the group members
        const membersToNotify = groupMemberDetails.filter(member => member.user_id !== posterId);

        // Fetch the group creator details
        const groupCreatorQuery = `
            SELECT 
                u.user_id, 
                u.displayname AS creator_name, 
                u.email AS creator_email
            FROM techcoach_lite.techcoach_groups g
            JOIN techcoach_lite.techcoach_users u ON u.user_id = g.created_by
            WHERE g.id = ?
        `;
        const groupCreatorDetails = await conn.query(groupCreatorQuery, [groupId]);

        if (!groupCreatorDetails || groupCreatorDetails.length === 0) {
            throw new Error("No group creator found");
        }

        // Add the group creator to the membersToNotify list
        const creator = groupCreatorDetails[0];
        membersToNotify.push({
            user_id: creator.user_id,
            member_name: creator.creator_name,
            member_email: creator.creator_email,
        });

        // Assuming decision_id and related decision details are fetched
        const { decision_name, decision_due_date, creation_date } = decisionId || {};
        const truncatedCommentText = truncateText(comment, 20);

        // Send email to each group member except the poster
        const emailPromises = membersToNotify.map(async (groupMember) => {
            // Check if the group member has a valid email
            if (!groupMember.member_email) {
                console.warn(`Skipping email for ${groupMember.member_name}: No email provided.`);
                return;  // Skip sending email if the member email is invalid
            }
            const htmlBody = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <p>Dear ${groupMember.member_name},</p>
                    <p>A comment has been posted on the decision titled "<strong>${decision_name}</strong>":</p>
                    <p><strong>Creation Date:</strong> ${new Date(creation_date).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> ${new Date(decision_due_date).toLocaleDateString()}</p>
                    <p><strong>Comment by ${posterDisplayName}:</strong></p> <!-- Updated to use the poster's displayname -->
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
                            address: groupMember.member_email?.trim(),
                            name: groupMember.member_name?.trim()
                        }
                    }
                ],
                subject: "Comment Posted on Your Shared Decision Circle",
                htmlbody: htmlBody
            };

            const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
            const zeptoMailApiKey = process.env.ZEPTO_MAIL_API_KEY;

            try {
                // Make sure the email recipient is valid before making the API call
                await axios.post(zeptoMailApiUrl, emailPayload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
                    }
                });
                // console.log(`Email sent to ${groupMember.member_email}`);
            } catch (err) {
                console.error(`Failed to send email to ${groupMember.member_email}:`, err.message);
            }
        });

        // Wait for all email sending promises to resolve
        await Promise.all(emailPromises);

        // Commit transaction
        await conn.commit();
        res.status(200).json({ message: 'Emails sent successfully to group members and creator' });
    } catch (error) {
        console.error('Error in sending email on Post comment to Decision circle:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const decisionCircleReplyComment = async (req, res) => {
    const { parentCommentId,decision, reply, groupId } = req.body;
    // console.log('decision:', decision);
    // console.log('groupId:', groupId);
    const memberId = req.user.id;


    let conn;

    // Helper to truncate text
    const truncateText = (text, maxLength) => {
        if (typeof text !== 'string') return '';
        if (!text || text.length <= maxLength) return text;
        const firstPart = text.substring(0, 10);
        const lastPart = text.substring(text.length - 10);
        return `${firstPart}...${lastPart}`;
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        // Fetch group members and original poster in a single query
        const groupAndPosterQuery = `
            SELECT 
                u.user_id, u.displayname AS member_name, u.email AS member_email, 
                op.displayname AS original_poster_name, op.email AS original_poster_email
            FROM techcoach_lite.techcoach_group_members gm
            JOIN techcoach_lite.techcoach_users u ON gm.member_id = u.user_id
            LEFT JOIN techcoach_lite.techcoach_conversations c ON c.id = ?
            LEFT JOIN techcoach_lite.techcoach_users op ON op.user_id = c.groupMember
            WHERE gm.group_id = ?;
        `;

        const groupMembers = await conn.query(groupAndPosterQuery, [parentCommentId,groupId]);

        if (!groupMembers || groupMembers.length === 0) {
            console.log("No group members or original poster found.");
            return res.status(400).json({ message: 'Invalid group or comment ID.' });
        }

       // Fetch replying user's details
        const replyingUserQuery = `SELECT displayname, email FROM techcoach_lite.techcoach_users WHERE user_id = ?`;
        const replyingUser = (await conn.query(replyingUserQuery, [memberId]))[0];

        if (!replyingUser) {
            throw new Error(`Replying user not found for user_id: ${memberId}`);
        }

        const { decision_name, decision_due_date, creation_date } = decision;
        const truncatedReplyText = truncateText(reply, 20);

        // Prepare email sending tasks
        const emailPromises = groupMembers.map(async (groupMember) => {
            const htmlBody = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <p>Dear ${groupMember.member_name},</p>
                    <p>A reply has been posted on the decision titled "<strong>${decision_name}</strong>":</p>
                    <p><strong>Creation Date:</strong> ${new Date(creation_date).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> ${new Date(decision_due_date).toLocaleDateString()}</p>
                    <p><strong>Reply by ${replyingUser.displayname}:</strong></p>
                    <p><em>${truncatedReplyText}</em></p>
                    <p>Regards,</p>
                    <p>Team @ Decision Coach</p>
                </div>
            `;

            const emailPayload = {
                from: { address: "noreply@ibacustechlabs.live",
                    name: "Decision Coach" },
                to: [{ email_address: { address: groupMember.member_email?.trim(), name: groupMember.member_name?.trim() } }],
                subject: "New Reply on Your Shared Decision Circle",
                htmlbody: htmlBody,
            };

            const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
            const zeptoMailApiKey = process.env.ZEPTO_MAIL_API_KEY;

            try {
                await axios.post(zeptoMailApiUrl, emailPayload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
                    }
                });
                // console.log(`Email sent to: ${groupMember.member_email}`);
            } catch (emailError) {
                console.error(`Failed to send email to: ${groupMember.member_email}`, emailError.message);
            }
        });

        // Wait for all email promises to complete
        await Promise.all(emailPromises);

        await conn.commit();
        res.status(200).json({ message: 'Emails Sent Successfully to Group Members' });
    } catch (error) {
        console.error('Error in sending email on reply to decision circle comment:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

// const decisionCircleReplyComment = async (req, res) => {
//     const { parentCommentId, decision, reply, groupId } = req.body;
//     const memberId = req.user.id;

//     let conn;

//     const truncateText = (text, maxLength) => {
//         if (typeof text !== 'string') {
//             console.warn('Input to truncateText is not a string:', text);
//             return '';
//         }

//         if (!text || text.length <= maxLength) return text;
//         const firstPart = text.substring(0, 10);
//         const lastPart = text.substring(text.length - 10);
//         return `${firstPart}...${lastPart}`;
//     };

//     try {
//         conn = await getConnection();
//         await conn.beginTransaction();

//         // Fetch all members of the group
//         const groupMemberQuery = `SELECT user_id, displayname, email FROM techcoach_lite.techcoach_users 
//                                   WHERE user_id IN (SELECT user_id FROM techcoach_lite.techcoach_group_members WHERE group_id = ?)`;
//         const groupMemberRows = await conn.query(groupMemberQuery, [groupId]);

//         // Fetch replying user's details
//         const replyingUserQuery = `SELECT displayname, email FROM techcoach_lite.techcoach_users WHERE user_id = ?`;
//         const replyingUser = (await conn.query(replyingUserQuery, [memberId]))[0];

//         if (!replyingUser) {
//             throw new Error(`Replying user not found for user_id: ${memberId}`);
//         }

//         const { decision_name, decision_due_date, creation_date } = decision;
//         const truncatedReplyText = truncateText(reply, 20);

//         // Send email to each group member
//         for (const groupMember of groupMemberRows) {
//             const htmlBody = `<div style="font-family: Arial, sans-serif; color: #333;">
//                 <p>Dear ${groupMember.displayname},</p>
//                 <p>A reply has been posted on the decision titled "<strong>${decision_name}</strong>":</p>
//                 <p><strong>Creation Date:</strong> ${new Date(creation_date).toLocaleDateString()}</p>
//                 <p><strong>Due Date:</strong> ${new Date(decision_due_date).toLocaleDateString()}</p>
//                 <p><strong>Reply by ${replyingUser.displayname}:</strong></p>
//                 <p><em>${truncatedReplyText}</em></p>
//                 <p>Regards,</p>
//                 <p>Team @ Decision Coach</p>
//             </div>`;

//             const emailPayload = {
//                 from: {
//                     address: "Decision-Coach@www.careersheets.in"
//                 },
//                 to: [
//                     {
//                         email_address: {
//                             address: groupMember.email
//                         }
//                     }
//                 ],
//                 subject: "New Reply on Your Shared Decision Circle",
//                 htmlbody: htmlBody
//             };

//             const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
//             const zeptoMailApiKey = 'PHtE6r1cReDp2m599RcG4aC8H5L3M45/+ONleQcSttwWWfEGSU1UrN8swDDjr08uV/cTE6OSzNpv5++e4e2ALWvqY2pIVGqyqK3sx/VYSPOZsbq6x00ZslQcfkbeUYHsd9Zs0ifRu92X';

//             await axios.post(zeptoMailApiUrl, emailPayload, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
//                 }
//             });
//         }

//         await conn.commit();
//         res.status(200).json({ message: 'Emails Sent Successfully to Group Members' });
//     } catch (error) {
//         console.error('Error in sending email on reply to decision circle comment:', error);
//         if (conn) await conn.rollback();
//         res.status(500).json({ error: 'An error occurred while processing your request' });
//     } finally {
//         if (conn) conn.release();
//     }
// };


const getdecisionSharedDecisionCirclebyuser = async (req, res) => {
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

        const sharedDecisionsQuery = `
        SELECT 
            tsd.decisionId AS decision_id,
            td.decision_name,
            td.user_statement,
            td.decision_taken_date,
            td.decision_due_date,
            tg.group_name,
            tg.id,
            tg.type_of_group,
            tu.displayname AS shared_by,
            tu.email AS shared_by_email,
            GROUP_CONCAT(tmu.displayname) AS shared_with_names,
            GROUP_CONCAT(tmu.email) AS shared_with_emails
        FROM techcoach_lite.techcoach_shared_decisions tsd
        JOIN techcoach_lite.techcoach_decision td ON tsd.decisionId = td.decision_id
        JOIN techcoach_lite.techcoach_groups tg ON tsd.groupId = tg.id
        JOIN techcoach_lite.techcoach_users tu ON td.user_id = tu.user_id
        JOIN techcoach_lite.techcoach_group_members tgm ON tg.id = tgm.group_id
        JOIN techcoach_lite.techcoach_users tmu ON tgm.member_id = tmu.user_id
        WHERE (tg.created_by = ? OR tgm.member_id = ?)
        AND tg.type_of_group = 'decision_circle'
        AND tgm.member_id != td.user_id          -- Exclude the decision creator from members list
        GROUP BY tsd.decisionId
        `;

        const sharedDecisions = await conn.query(sharedDecisionsQuery, [userId,userId]);

        if (!Array.isArray(sharedDecisions)) {
            res.status(500).json({ error: 'Unexpected data format: sharedDecisions is not an array' });
            return;
        }

        if (sharedDecisions.length === 0) {
            res.status(200).json({ message: 'No shared decisions found', decisionCount: 0 });
            return;
        }

        const decisionIds = sharedDecisions.map(sd => sd.decision_id);

        for (const decision of sharedDecisions) {
            const { decision_id, shared_by, shared_by_email } = decision;

            const keyData = undefined + `${shared_by}${shared_by_email}`;
            const encryptedKey = encryptText(keyData, process.env.PUBLIC_KEY);

            decision.decision_name = decryptText(decision.decision_name, encryptedKey);
            decision.user_statement = decryptText(decision.user_statement, encryptedKey);

            const decisionReasonQuery = `
                SELECT decision_reason_text 
                FROM techcoach_lite.techcoach_decision_reason 
                WHERE decision_id = ?`;

            const decisionReasons = await conn.query(decisionReasonQuery, [decision_id]);

            decision.reasons = decisionReasons.map(reason =>
                decryptText(reason.decision_reason_text, encryptedKey)
            );
        }

        const decisionTags = await conn.query(
            `SELECT dt.decision_id, t.tag_name, t.tag_type 
             FROM techcoach_lite.techcoach_decision_tag_linked_info dt
             JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
             WHERE dt.decision_id IN (?)`,
            [decisionIds]
        );

        sharedDecisions.forEach(decision => {
            decision.tags = decisionTags
                .filter(tag => tag.decision_id === decision.decision_id)
                .map(tag => ({ tag_name: tag.tag_name, tag_type: tag.tag_type }));
        });

        res.status(200).json({
            message: 'Shared Decisions Fetched Successfully',
            results: sharedDecisions,
            decisionCount: sharedDecisions.length
        });

    } catch (error) {
        console.error('Error fetching shared decisions:', error);
        res.status(500).json({ error: 'An error occurred while fetching shared decisions' });
    } finally {
        if (conn) conn.release();
    }
};

const getUserSharedDecisions = async (req, res) => {
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
            return 'Decryption failed';
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

        // Fetch decisions shared with the group and specific user
        const decisionQuery = `
            SELECT 
    tsd.decisionId AS decision_id,
    td.decision_name,
    td.user_statement,
    td.decision_taken_date,
    td.decision_due_date,
    tg.group_name,
    tg.type_of_group,
    tu.displayname AS shared_by,
    tu.email AS shared_by_email,
    GROUP_CONCAT(tmu.displayname) AS shared_with_names,
    GROUP_CONCAT(tmu.email) AS shared_with_emails
FROM techcoach_lite.techcoach_shared_decisions tsd
JOIN techcoach_lite.techcoach_decision td ON tsd.decisionId = td.decision_id
JOIN techcoach_lite.techcoach_groups tg ON tsd.groupId = tg.id
JOIN techcoach_lite.techcoach_users tu ON td.user_id = tu.user_id
JOIN techcoach_lite.techcoach_group_members tgm ON tsd.groupId = tgm.group_id
JOIN techcoach_lite.techcoach_users tmu ON tgm.member_id = tmu.user_id
WHERE tu.user_id = ? 
  AND tg.type_of_group = 'decision_circle'
GROUP BY tsd.decisionId
`;

        const getDecisions = await conn.query(decisionQuery, [userId]);

        if (!Array.isArray(getDecisions) || !getDecisions.length) {
            return res.status(200).json({ message: 'No decisions found for the user', results: [], decisionCount: 0 });
        }

        const decisionDetailsMap = new Map();

        // Loop through decisions, decrypt fields and fetch additional data
        for (const decision of getDecisions) {
            const { decision_id, shared_by, shared_by_email } = decision;

            // Key generation for decryption (you might need to modify this logic)
            const keyData = undefined + shared_by + shared_by_email;
            const encryptedKey = encryptText(keyData, process.env.PUBLIC_KEY);

            // Decrypt fields
            decision.decision_name = decryptText(decision.decision_name, encryptedKey);
            decision.user_statement = decryptText(decision.user_statement, encryptedKey);

            // Fetch and decrypt decision reasons
            const decisionReasonQuery = `
                SELECT decision_reason_text 
                FROM techcoach_lite.techcoach_decision_reason 
                WHERE decision_id = ?`;

            const decisionReasons = await conn.query(decisionReasonQuery, [decision_id]);

            decision.reasons = decisionReasons.map(reason =>
                decryptText(reason.decision_reason_text, encryptedKey)
            );

            decisionDetailsMap.set(decision_id, decision);
        }

        // Extract decision IDs for querying tags
        const decisionIds = [...decisionDetailsMap.keys()];

        if (decisionIds.length > 0) {
            // Fetch tags associated with the decisions
            const tagQuery = `
                SELECT dt.decision_id, t.tag_name, t.tag_type 
                FROM techcoach_lite.techcoach_decision_tag_linked_info dt
                JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
                WHERE dt.decision_id IN (?)`;

            const decisionTags = await conn.query(tagQuery, [decisionIds]);

            // Attach tags to corresponding decisions
            decisionTags.forEach(tag => {
                const decision = decisionDetailsMap.get(tag.decision_id);
                if (decision) {
                    if (!decision.tags) {
                        decision.tags = [];
                    }
                    decision.tags.push({ tag_name: tag.tag_name, tag_type: tag.tag_type });
                }
            });
        }

        const decryptedResults = [...decisionDetailsMap.values()];

        res.status(200).json({
            message: 'Decisions shared with the user fetched successfully',
            results: decryptedResults,
            decisionCount: decryptedResults.length
        });

        await conn.commit();
    } catch (error) {
        console.error('Error fetching decisions shared with the user:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while fetching shared decisions' });
    } finally {
        if (conn) conn.release();
    }
};


module.exports = {
    getUserList,
    decisionCircleCreation,
    getUserDecisionCircles,
    getdecisionCirclesByUser,
    getdecisionCirclesByUserAndMember,
    // getdecisionCircle,
    // getAllGroups,
    getUsersForGroup,
    removeUsersFromGroup,
    getGroupDetails,
    sendDecisionCircleInvitation,
    decisionshareDecisionCircle,
    getdecisionSharedDecisionCircle,
    getMemberSharedDecisions,
    decisionCirclePostComment,
    decisionCircleReplyComment,
    getdecisionSharedDecisionCirclebyuser,
    getUserSharedDecisions
};