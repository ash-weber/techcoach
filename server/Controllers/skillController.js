const getConnection = require('../Models/database');

const postSkill = async (req, res) => {
  const { skill_name, rating, comments } = req.body;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;
    // Fetch the skill_id based on the skill_name
    const rows = await conn.query(
      "SELECT skill_id FROM techcoach_lite.techcoach_soft_skill WHERE skill_name = ?",
      [skill_name]
    );

    if (rows.length === 0) {
      throw new Error(`Skill name '${skill_name}' not found in techcoach_soft_skill table`);
    }

    const skillId = rows[0].skill_id;

    // Insert into techcoach_soft_skill_value using the skill_id
    await conn.query(
      "INSERT INTO techcoach_lite.techcoach_soft_skill_value (skill_id, rating, comments, user_id) VALUES (?,?,?,?)",
      [skillId, rating, comments || null, userId]
    );

    await conn.commit();
    res.status(200).json({ message: 'Skill data inserted successfully' });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) conn.release();
  }
};

const getMasterSkills = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const rows = await conn.query("SELECT skill_id, skill_name,description FROM techcoach_lite.techcoach_soft_skill");

    if (rows.length > 0) {
      res.status(200).json({ skills: rows });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching master skills' });
  } finally {
    if (conn) conn.release();
  }
};


const getAllSkill = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const userId = req.user.id;
    const rows = await conn.query(
      `SELECT 
    ts.skill_id, 
    ts.skill_name, 
    ts.description,
    tsv.id, 
    tsv.rating, 
    tsv.comments, 
    tsv.user_id
FROM 
    techcoach_lite.techcoach_soft_skill ts
LEFT OUTER JOIN 
    techcoach_lite.techcoach_soft_skill_value tsv 
ON 
    ts.skill_id = tsv.skill_id 
AND 
    tsv.user_id = ?`,
      [userId]
    );

    res.status(200).json({ skills: rows });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching skill data' });
  } finally {
    if (conn) conn.release();
  }
};


const getSkill = async (req, res) => {
  let conn;
  const { id } = req.params; 
  const userId = req.user.id;

  if (!id) {
    return res.status(400).json({ error: 'Skill ID is required' });
  }

  try {
    conn = await getConnection();

    // Query to fetch the skill details by id
    const rows = await conn.query(
      `SELECT 
        ts.skill_id, 
        ts.skill_name, 
        ts.description,
        tsv.id, 
        tsv.rating, 
        tsv.comments, 
        tsv.user_id
      FROM 
        techcoach_lite.techcoach_soft_skill ts
      JOIN 
        techcoach_lite.techcoach_soft_skill_value tsv 
      ON 
        ts.skill_id = tsv.skill_id 
      AND 
        tsv.user_id = ?
      WHERE 
        tsv.id = ?`,
      [userId, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.status(200).json({ skill: rows }); 
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching skill data' });
  } finally {
    if (conn) conn.release();
  }
};


const putSkill = async (req, res) => {
  let conn;
  const { id } = req.params;
  const userId = req.user.id;
  const { skill_name, rating, comments } = req.body;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    // Check if the skill exists before updating
    const existingSkill = await conn.query(
      "SELECT * FROM techcoach_lite.techcoach_soft_skill_value WHERE user_id = ? AND id = ?",
      [userId, id]
    );

    if (existingSkill.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Fetch the skill_id based on the skill_name (for validation)
    const rows = await conn.query(
      "SELECT skill_id FROM techcoach_lite.techcoach_soft_skill WHERE skill_name = ?",
      [skill_name]
    );

    if (rows.length === 0) {
      throw new Error(`Skill name '${skill_name}' not found in techcoach_soft_skill table`);
    }

    const skillId = rows[0].skill_id;

    // Update the skill data
    await conn.query(
      "UPDATE techcoach_lite.techcoach_soft_skill_value SET skill_id = ?, rating = ?, comments = ? WHERE user_id = ? AND id = ?",
      [skillId, rating, comments || null, userId, id]
    );

    await conn.commit();
    res.status(200).json({ message: 'Skill data updated successfully' });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while updating skill data' });
  } finally {
    if (conn) conn.release();
  }
};


const deleteAllSkill = async (req, res) => {
  let conn;


  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;
    // Delete the skill
    const result = await conn.query(
      "DELETE FROM techcoach_lite.techcoach_soft_skill_value WHERE  user_id = ?",
      [userId]
    );

    await conn.commit();
    res.status(200).json({ message: 'Skill data deleted successfully' });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while deleting skill data' });
  } finally {
    if (conn) conn.release();
  }
};


const deleteSkill = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  let conn;

  if (!id || !userId) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    conn = await getConnection();

    // Check if the skill exists before attempting to delete
    const skill = await conn.query(
      "SELECT * FROM techcoach_lite.techcoach_soft_skill_value WHERE user_id = ? AND id = ?",
      [userId, id]
    );

    if (skill.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Delete skill from the database
    const result = await conn.query(
      "DELETE FROM techcoach_lite.techcoach_soft_skill_value WHERE user_id = ? AND id = ?",
      [userId, id]
    );


    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Skill not found or already deleted' });
    }

    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting skill data' });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { postSkill, getMasterSkills, getAllSkill, getSkill, putSkill, deleteAllSkill, deleteSkill }