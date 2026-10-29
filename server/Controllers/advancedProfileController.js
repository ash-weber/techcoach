const getConnection = require("../Models/database");
const crypto = require('crypto');


const getUserList = async (req, res) => {
    let conn;
    try {
      const userId = req.user.id;
  
      conn = await getConnection();
      await conn.beginTransaction();
  
  
      const tasks = await conn.query(`
          SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?;
        `, [userId]);
  
      await conn.commit();
  
      res.status(200).json({ message: 'User List Fetched successfully', tasks });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
      if (conn) conn.release();
    }
};


const postAdvancedProfile = async (req, res) => {
    const { goals,values,resolutions,constraints,other_factors } = req.body;
  
    let conn;
    try {
      conn = await getConnection();
      await conn.beginTransaction();
  
      const userId = req.user.id;
  
      const currentDate = new Date().toISOString().slice(0, 10);
  
      const encryptText = (text, key) => {
        try {
          if (typeof text !== 'string') {
            text = JSON.stringify(text);
          }
          const cipher = crypto.createCipher('aes-256-cbc', key);
          let encryptedText = cipher.update(text, 'utf8', 'hex');
          encryptedText += cipher.final('hex');
          return encryptedText;
        } catch (error) {
          console.error('Error encrypting text:', error);
          return null;
        }
      };
      
      const headersAndValues = [
        { headerName: 'Goals', headerValue: goals },
        { headerName: 'Values', headerValue: values },
        { headerName: 'Resolutions', headerValue: resolutions },
        { headerName: 'Constraints', headerValue: constraints },
        { headerName: 'OtherFactors', headerValue: other_factors }
      ];
  
      for (const { headerName, headerValue } of headersAndValues) {
        if (headerValue && headerValue.length > 0) {
          const headerRows = await conn.query(
            `SELECT header_id FROM techcoach_lite.techcoach_profile_swot_headers WHERE header_name = ? AND type_of_profile = 'Advanced_Profile'`,
            [headerName]
          );
  
          const headerId = headerRows[0]?.header_id;
    
          if (!headerId) {
            throw new Error(`Header ID not found for header name: ${headerName}`);
          }
  
          if (Array.isArray(headerValue)) {
            for (const value of headerValue) {
              const encryptedValue = encryptText(value, req.user.key);
              await conn.query(
                "INSERT INTO techcoach_lite.techcoach_profile_swot_values (user_id, header_id, header_value) VALUES (?, ?, ?)",
                [userId, headerId, encryptedValue]
              );
            }
          } else {
            const encryptedValue = encryptText(headerValue, req.user.key);
            await conn.query(
              "INSERT INTO techcoach_lite.techcoach_profile_swot_values (user_id, header_id, header_value) VALUES (?, ?, ?)",
              [userId, headerId, encryptedValue]
            );
          }
        }
      }
  
      await conn.commit();
      res.status(200).json({ message: 'Advanced Profile data inserted successfully' });
    } catch (error) {
      console.error('Error inserting general profile data:', error);
      if (conn) {
        await conn.rollback();
      }
      res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
      if (conn) conn.release();
    }
};


const getMasterProfiles = async (req,res) => {
    let conn;
    try {
      conn = await getConnection();
      const rows = await conn.query("SELECT header_id ,header_name FROM techcoach_lite.techcoach_profile_swot_headers WHERE type_of_profile = 'Advanced_Profile' ");
      if (rows.length > 0) {
        res.status(200).json({profiles : rows })
      } else {
        res.status(404).json({ message: 'No profiles found' });
      }
    } catch (error) {
      res.status(500).json({ error:'An error occured while fetching master profiles'});
    } finally {
      if (conn) conn.release();
    }
};


const getAdvancedProfile = async (req, res) => {
    const userId = req.user.id;
    const userKey = req.user.key;

    if (!userId || !userKey) {
        return res.status(400).json({ error: 'User authentication details are missing' });
      }
 
    const decryptText = (encryptedText, key) => {
        try {
          if (!encryptedText) return null;
          const decipher = crypto.createDecipher('aes-256-cbc', key);
          let decryptedText = decipher.update(encryptedText, 'hex', 'utf8');
          decryptedText += decipher.final('utf8');
          return decryptedText;
        } catch (err) {
          console.error('Decryption error:', err);
          return null;
        }
      };

    let conn;
  
    try {
      conn = await getConnection();
  
      // Query to get the header names and ids
      const headerNamesResult = await conn.query(
        "SELECT header_id, header_name FROM techcoach_lite.techcoach_profile_swot_headers WHERE type_of_profile = 'Advanced_Profile'"
      );
  
      const headerMap = (headerNamesResult.rows || headerNamesResult).reduce((acc, { header_id, header_name }) => {
        acc[header_name.toLowerCase()] = header_id;
        return acc;
      }, {});
  
      // Query to get the header values for the user
      const headerValuesResult = await conn.query(
        `SELECT v.id, h.header_name, v.header_value , h.type_of_profile
        FROM techcoach_lite.techcoach_profile_swot_values v 
        JOIN techcoach_lite.techcoach_profile_swot_headers h ON v.header_id = h.header_id 
        WHERE v.user_id = ? AND h.type_of_profile = 'Advanced_Profile'`,
        [userId]
      );
  
      const profileDetails = headerValuesResult.reduce((acc, { id, header_name, header_value }) => {
        const key = header_name.toLowerCase();
        if (!acc[key]) {
          acc[key] = [];
        }
        const decryptedValue = decryptText(header_value, userKey);
        acc[key].push({ id, value: decryptedValue });
        return acc;
      }, {});
  
      const fullProfile = {
        user_id: userId,
        generated_at: new Date().toISOString(),
        header_count: Object.keys(profileDetails).length,
        ...profileDetails
      };
  
      res.status(200).json(fullProfile);
    } catch (error) {
      console.error('Error retrieving profile data:', error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
      if (conn) conn.release();
    }
};


const putAdvancedProfile = async (req, res) => {
    const { goals,values,resolutions,constraints,other_factors } = req.body;
    const userKey = req.user.key;
  
    let conn;
    try {
      conn = await getConnection();
      await conn.beginTransaction();
  
      // Validate User ID:
      const userId = req.user.id;
  
      const encryptText = (text, key) => {
        const cipher = crypto.createCipher('aes-256-cbc', key);
        let encryptedText = cipher.update(text, 'utf8', 'hex');
        encryptedText += cipher.final('hex');
        return encryptedText;
      };
  
      // Process Header and Values:
      const headersAndValues = [
        { headerName: 'Goals', headerValue: goals },
        { headerName: 'Values', headerValue: values },
        { headerName: 'Resolutions', headerValue: resolutions },
        { headerName: 'Constraints', headerValue: constraints },
        { headerName: 'OtherFactors', headerValue: other_factors }
      ];
  
      for (const { headerName, headerValue } of headersAndValues) {
        if (headerValue && headerValue.length > 0) {
          const headerRows = await conn.query(
            "SELECT header_id FROM techcoach_lite.techcoach_profile_swot_headers WHERE header_name = ? AND type_of_profile = 'Advanced_Profile' ",
            [headerName]
          );
  
          const headerId = headerRows[0]?.header_id;
  
  
          if (!headerId) {
            throw new Error(`Header ID not found for header name: ${headerName}`);
          }
  
          // Retrieve existing header values and their row_ids for the user and header
          const existingHeaderValues = await conn.query(
            "SELECT id, header_value FROM techcoach_lite.techcoach_profile_swot_values WHERE user_id = ? AND header_id = ?",
            [userId, headerId]
          );
  
          const existingHeaderValuesMap = existingHeaderValues.reduce((acc, { id, header_value }) => {
            acc[header_value] = id;
            return acc;
          }, {});
  
          // Prepare an array to store encrypted values to be deleted
          const valuesToDelete = [];
  
          // Insert new values and update existing ones
          if (Array.isArray(headerValue)) {
            for (const value of headerValue) {
              // Check if value is a string and not empty
              if (typeof value === 'string' && value.trim() !== '') {
                const encryptedValue = encryptText(value, userKey);
                if (existingHeaderValuesMap[encryptedValue]) {
                  // Update existing value
                  delete existingHeaderValuesMap[encryptedValue]; // Remove the value from the map
                  await conn.query(
                    "UPDATE techcoach_lite.techcoach_profile_swot_values SET header_value = ? WHERE id = ?",
                    [encryptedValue, existingHeaderValuesMap[encryptedValue]]
                  );
                } else {
                  // Insert new value
                  await conn.query(
                    "INSERT INTO techcoach_lite.techcoach_profile_swot_values (user_id, header_id, header_value) VALUES (?, ?, ?)",
                    [userId, headerId, encryptedValue]
                  );
                }
              }
            }
          } else {
            // Check if headerValue is a string and not empty
            if (typeof headerValue === 'string' && headerValue.trim() !== '') {
              const encryptedValue = encryptText(headerValue, userKey);
              if (existingHeaderValuesMap[encryptedValue]) {
                // Update existing value
                delete existingHeaderValuesMap[encryptedValue]; // Remove the value from the map
                await conn.query(
                  "UPDATE techcoach_lite.techcoach_profile_swot_values SET header_value = ? WHERE id = ?",
                  [encryptedValue, existingHeaderValuesMap[encryptedValue]]
                );
              } else {
                // Insert new value
                await conn.query(
                  "INSERT INTO techcoach_lite.techcoach_profile_swot_values (user_id, header_id, header_value) VALUES (?, ?, ?)",
                  [userId, headerId, encryptedValue]
                );
              }
            }
          }
  
          // Add remaining values in the map to the delete array
          valuesToDelete.push(...Object.values(existingHeaderValuesMap));
          
          // Delete removed values from the database
          if (valuesToDelete.length > 0) {
            await conn.query(
              "DELETE FROM techcoach_lite.techcoach_profile_swot_values WHERE id IN (?)",
              [valuesToDelete]
            );
          }
        }
      }
  
      await conn.commit();
      res.status(200).json({ message: 'General Advanced Profile data updated successfully' });
    } catch (error) {
      console.error('Error updating general profile data:', error);
      if (conn) {
        await conn.rollback();
      }
      res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
      if (conn) conn.release();
    }
};


module.exports = { getUserList , postAdvancedProfile , getMasterProfiles ,getAdvancedProfile , putAdvancedProfile }