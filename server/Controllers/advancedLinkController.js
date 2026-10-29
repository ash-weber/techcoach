const getConnection = require('../Models/database');
const crypto = require('crypto');

const postAdvancedProfile = async (req,res) =>{
    const { decision_id, v_ids} = req.body;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const userId = req.user.id;

        const decisionRows = await conn.query('SELECT * FROM techcoach_lite.techcoach_decision WHERE decision_id = ?',[decision_id]);
        if (decisionRows.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Invalid decision_id'});
        }

        const vIds = [];
        for (const v_id of v_ids){
            const vIdRows = await conn.query(
                "SELECT id FROM techcoach_lite.techcoach_profile_swot_values WHERE id = ?",
                [v_id]
            );
            if(vIdRows.length === 0) {
                await conn.rollback();
                return res.status(400).json({ error: `No matching id found for id: ${v_id}`});
            }

            vIds.push(vIdRows[0].id);
        }

        for (const v_id of vIds) {
            await conn.query(
                "INSERT INTO techcoach_lite.techcoach_decision_swot_linked_info (decision_id,user_id,v_id) VALUES (?,?,?)",
                [decision_id,userId,v_id]
            );
        }
        await conn.commit();
        res.status(200).json({message:'Records inserted succesfully'});
        
    } catch (error) {
        console.error('Error inserting data:',error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'DataBase Error'});
    } finally {
        if (conn) conn.release();
    }
}

const getAllAdvancedProfileLink = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();

        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const rows = await conn.query(
            `SELECT 
                dh.decision_id,
                d.decision_name,
                v.id AS v_id,
                h.header_name,
                v.header_value,
                h.type_of_profile
            FROM 
                techcoach_lite.techcoach_decision_swot_linked_info dh
            JOIN 
                techcoach_lite.techcoach_decision d ON dh.decision_id = d.decision_id
            JOIN 
                techcoach_lite.techcoach_profile_swot_values v ON dh.v_id = v.id
            JOIN 
                techcoach_lite.techcoach_profile_swot_headers h ON v.header_id = h.header_id 
            WHERE 
                d.user_id = ?`,
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No Profile records found' });
        }

        // Decryption function
        const decryptText = (text, key) => {
            if (!text) return null;
            try {
                const decipher = crypto.createDecipher('aes-256-cbc', key);
                let decryptedText = decipher.update(text, 'hex', 'utf-8');
                decryptedText += decipher.final('utf-8');
                return decryptedText;
            } catch (error) {
                console.error('Error decrypting text:', error);
                return null;
            }
        };

        const decryptedProfileRows = rows.map(row => ({
            ...row,
            decision_name: decryptText(row.decision_name, req.user.key),
            header_name: row.header_name,
            header_value:decryptText(row.header_value,req.user.key),
        }));

        res.status(200).json({ profiles: decryptedProfileRows });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
};

const deleteAdvancedProfileLink = async (req,res) => {
    const { id } = req.params;
    let conn;
    
    try{
     conn = await getConnection();
     await conn.beginTransaction();
 
      const userId = req.user.id;
 
      const result = await conn.query(
         "DELETE FROM techcoach_lite.techcoach_decision_swot_linked_info WHERE decision_id = ?",
         [id]
      );
      
      await conn.commit();
      res.status(200).json({message:'Decision-link data deleted successfully'});
 
    } catch (error) {
     if (conn) {
         await conn.rollback();
     }
     res.status(500).json({ error: 'An error occured while deleting decison-link data'});
    } finally {
     if (conn) conn.release();
    }
};

module.exports = { postAdvancedProfile, getAllAdvancedProfileLink, deleteAdvancedProfileLink}