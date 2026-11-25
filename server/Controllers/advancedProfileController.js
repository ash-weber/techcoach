const getConnection = require("../Models/database");
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";

const getSecureKey = (keyString) =>
  crypto
    .createHash("sha256")
    .update(String(keyString))
    .digest("base64")
    .substr(0, 32);

const encryptText = (text, userKey) => {
  try {
    if (typeof text !== "string") {
      text = JSON.stringify(text);
    }

    const key = getSecureKey(userKey);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);

    let encrypted = cipher.update(text, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
};

const decryptText = (text, userKey) => {
  if (!text || typeof text !== "string") {
    return null;
  }

  if (text.includes(":")) {
    try {
      const key = getSecureKey(userKey);
      const [ivHex, encryptedHex] = text.split(":");

      const iv = Buffer.from(ivHex, "hex");
      const encryptedText = Buffer.from(encryptedHex, "hex");

      if (iv.length !== 16 || encryptedText.length === 0) {
        throw new Error("Invalid encrypted data format");
      }

      const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);

      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString("utf8");
    } catch (error) {
      console.error("New format decryption failed:", error);
      return null;
    }
  }

  try {
    const decipher = crypto.createDecipher(ALGORITHM, userKey);

    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Legacy decryption failed:", error);
    return null;
  }
};

const getUserList = async (req, res) => {
  let conn;
  try {
    const userId = req.user.id;

    conn = await getConnection();
    await conn.beginTransaction();

    const tasks = await conn.query(
      `
          SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?;
        `,
      [userId],
    );

    await conn.commit();

    res.status(200).json({ message: "User List Fetched successfully", tasks });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  } finally {
    if (conn) conn.release();
  }
};

const postAdvancedProfile = async (req, res) => {
  const { goals, values, resolutions, constraints, other_factors } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;

    const currentDate = new Date().toISOString().slice(0, 10);

    const headersAndValues = [
      { headerName: "Goals", headerValue: goals },
      { headerName: "Values", headerValue: values },
      { headerName: "Resolutions", headerValue: resolutions },
      { headerName: "Constraints", headerValue: constraints },
      { headerName: "OtherFactors", headerValue: other_factors },
    ];

    for (const { headerName, headerValue } of headersAndValues) {
      if (headerValue && headerValue.length > 0) {
        const headerRows = await conn.query(
          `SELECT header_id FROM techcoach_lite.techcoach_profile_swot_headers WHERE header_name = ? AND type_of_profile = 'Advanced_Profile'`,
          [headerName],
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
              [userId, headerId, encryptedValue],
            );
          }
        } else {
          const encryptedValue = encryptText(headerValue, req.user.key);
          await conn.query(
            "INSERT INTO techcoach_lite.techcoach_profile_swot_values (user_id, header_id, header_value) VALUES (?, ?, ?)",
            [userId, headerId, encryptedValue],
          );
        }
      }
    }

    await conn.commit();
    res
      .status(200)
      .json({ message: "Advanced Profile data inserted successfully" });
  } catch (error) {
    console.error("Error inserting general profile data:", error);
    if (conn) {
      await conn.rollback();
    }
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  } finally {
    if (conn) conn.release();
  }
};

const getMasterProfiles = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const rows = await conn.query(
      "SELECT header_id ,header_name FROM techcoach_lite.techcoach_profile_swot_headers WHERE type_of_profile = 'Advanced_Profile' ",
    );
    if (rows.length > 0) {
      res.status(200).json({ profiles: rows });
    } else {
      res.status(404).json({ message: "No profiles found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching master profiles" });
  } finally {
    if (conn) conn.release();
  }
};

const getAdvancedProfile = async (req, res) => {
  const userId = req.user.id;
  const userKey = req.user.key;

  if (!userId || !userKey) {
    return res
      .status(400)
      .json({ error: "User authentication details are missing" });
  }

  let conn;

  try {
    conn = await getConnection();

    const headerNamesResult = await conn.query(
      "SELECT header_id, header_name FROM techcoach_lite.techcoach_profile_swot_headers WHERE type_of_profile = 'Advanced_Profile'",
    );

    const headerMap = (headerNamesResult.rows || headerNamesResult).reduce(
      (acc, { header_id, header_name }) => {
        acc[header_name.toLowerCase()] = header_id;
        return acc;
      },
      {},
    );

    const headerValuesResult = await conn.query(
      `SELECT v.id, h.header_name, v.header_value , h.type_of_profile
        FROM techcoach_lite.techcoach_profile_swot_values v 
        JOIN techcoach_lite.techcoach_profile_swot_headers h ON v.header_id = h.header_id 
        WHERE v.user_id = ? AND h.type_of_profile = 'Advanced_Profile' AND v.is_active = 1`,
      [userId],
    );

    const profileDetails = headerValuesResult.reduce(
      (acc, { id, header_name, header_value }) => {
        const key = header_name.toLowerCase();
        if (!acc[key]) {
          acc[key] = [];
        }
        const decryptedValue = decryptText(header_value, userKey);
        acc[key].push({ id, value: decryptedValue });
        return acc;
      },
      {},
    );

    const fullProfile = {
      user_id: userId,
      generated_at: new Date().toISOString(),
      header_count: Object.keys(profileDetails).length,
      ...profileDetails,
    };

    res.status(200).json(fullProfile);
  } catch (error) {
    console.error("Error retrieving profile data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  } finally {
    if (conn) conn.release();
  }
};

/* const putAdvancedProfile = async (req, res) => {
  const { goals, values, resolutions, constraints, other_factors } = req.body;
  const userKey = req.user.key;

  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;

    const headersAndValues = [
      { headerName: "Goals", headerValue: goals },
      { headerName: "Values", headerValue: values },
      { headerName: "Resolutions", headerValue: resolutions },
      { headerName: "Constraints", headerValue: constraints },
      { headerName: "OtherFactors", headerValue: other_factors },
    ];

    for (const { headerName, headerValue } of headersAndValues) {
      if (headerValue && headerValue.length > 0) {
        const headerRows = await conn.query(
          "SELECT header_id FROM techcoach_lite.techcoach_profile_swot_headers WHERE header_name = ? AND type_of_profile = 'Advanced_Profile' ",
          [headerName],
        );

        const headerId = headerRows[0]?.header_id;

        if (!headerId) {
          throw new Error(`Header ID not found for header name: ${headerName}`);
        }

        const existingHeaderValues = await conn.query(
          `SELECT id, header_value
   FROM techcoach_lite.techcoach_profile_swot_values
   WHERE user_id = ? AND header_id = ?`,
          [userId, headerId],
        );

        const existingHeaderValuesMap = new Map();

        for (const row of existingHeaderValues) {
          const plainValue = decryptText(row.header_value, userKey);

          if (plainValue !== null) {
            existingHeaderValuesMap.set(plainValue, row.id);
          }
        }

        const valuesToKeep = Array.isArray(headerValue)
          ? headerValue
          : [headerValue];

        for (const value of valuesToKeep) {
          if (typeof value !== "string" || value.trim() === "") {
            continue;
          }

          if (existingHeaderValuesMap.has(value)) {
            const existingId = existingHeaderValuesMap.get(value);

            existingHeaderValuesMap.delete(value);

            const encryptedValue = encryptText(value, userKey);

            await conn.query(
              `UPDATE techcoach_lite.techcoach_profile_swot_values
       SET header_value = ?
       WHERE id = ?`,
              [encryptedValue, existingId],
            );
          } else {
            const encryptedValue = encryptText(value, userKey);

            await conn.query(
              `INSERT INTO techcoach_lite.techcoach_profile_swot_values
       (user_id, header_id, header_value)
       VALUES (?, ?, ?)`,
              [userId, headerId, encryptedValue],
            );
          }
        }

        const valuesToDelete = [...existingHeaderValuesMap.values()];

        if (valuesToDelete.length > 0) {
          await conn.query(
            `DELETE FROM techcoach_lite.techcoach_profile_swot_values
     WHERE id IN (?)`,
            [valuesToDelete],
          );
        }
      }
    }

    await conn.commit();
    res
      .status(200)
      .json({ message: "General Advanced Profile data updated successfully" });
  } catch (error) {
    console.error("Error updating general profile data:", error);
    if (conn) {
      await conn.rollback();
    }
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  } finally {
    if (conn) conn.release();
  }
}; */

/* const putAdvancedProfile = async (req, res) => {
  const { goals, values, resolutions, constraints, other_factors } = req.body;
  const userKey = req.user.key;

  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;

    const headersAndValues = [
      { headerName: "Goals", headerValue: goals },
      { headerName: "Values", headerValue: values },
      { headerName: "Resolutions", headerValue: resolutions },
      { headerName: "Constraints", headerValue: constraints },
      { headerName: "OtherFactors", headerValue: other_factors },
    ];

    const safeDecrypt = (text) => {
      if (!text) return text;
      try {
        return decryptText(text, userKey);
      } catch {
        return null;
      }
    };

    const norm = (s) => (typeof s === "string" ? s.trim() : "");

    const plan = [];           
    const allToDelete = [];    

    for (const { headerName, headerValue } of headersAndValues) {
      if (!headerValue || headerValue.length === 0) continue;

      const headerRows = await conn.query(
        "SELECT header_id FROM techcoach_lite.techcoach_profile_swot_headers WHERE header_name = ? AND type_of_profile = 'Advanced_Profile'",
        [headerName],
      );
      const headerId = headerRows[0]?.header_id;
      if (!headerId) {
        throw new Error(`Header ID not found for header name: ${headerName}`);
      }

      const existingRows = await conn.query(
        `SELECT id, header_value
         FROM techcoach_lite.techcoach_profile_swot_values
         WHERE user_id = ? AND header_id = ?`,
        [userId, headerId],
      );

      const existingMap = new Map();
      for (const row of existingRows) {
        const plain = safeDecrypt(row.header_value);
        if (plain === null) continue;
        const key = norm(plain);
        if (key && !existingMap.has(key)) {
          existingMap.set(key, row.id);
        }
      }

      const incoming = (Array.isArray(headerValue) ? headerValue : [headerValue])
        .map(norm)
        .filter((v) => v !== "");

      const seen = new Set();
      const valuesToKeep = [];
      for (const v of incoming) {
        if (!seen.has(v)) {
          seen.add(v);
          valuesToKeep.push(v);
        }
      }

      const toUpdate = []; 
      const toInsert = []; 
      const keptIds = new Set();

      for (const v of valuesToKeep) {
        if (existingMap.has(v)) {
          const id = existingMap.get(v);
          toUpdate.push({ id, value: v });
          keptIds.add(id);
        } else {
          toInsert.push(v);
        }
      }

      const valuesToDelete = [];
      for (const [key, id] of existingMap.entries()) {
        if (!keptIds.has(id)) valuesToDelete.push(id);
      }

      plan.push({ headerName, headerId, toUpdate, toInsert, valuesToDelete });
      allToDelete.push(...valuesToDelete);
    }

    if (allToDelete.length > 0) {
      const linkedRows = await conn.query(
        `SELECT
           l.v_id,
           p.header_value,
           h.header_name,
           d.decision_id,
           d.decision_name
         FROM techcoach_lite.techcoach_decision_swot_linked_info l
         LEFT JOIN techcoach_lite.techcoach_decision d
           ON d.decision_id = l.decision_id
         LEFT JOIN techcoach_lite.techcoach_profile_swot_values p
           ON p.id = l.v_id
         LEFT JOIN techcoach_lite.techcoach_profile_swot_headers h
           ON h.header_id = p.header_id
         WHERE l.v_id IN (?)`,
        [allToDelete],
      );

      if (linkedRows.length > 0) {
        await conn.rollback();
        return res.status(409).json({
          error: "LINKED_VALUES",
          message: `Cannot remove value(s) because they are linked to existing decision(s).`,
          linked: linkedRows.map((r) => ({
            v_id: r.v_id,
            v_header: safeDecrypt(r.header_value),
            header_name: r.header_name,
            decision_id: r.decision_id,
            decision_name:
              safeDecrypt(r.decision_name) || `Decision #${r.decision_id}`,
          })),
        });
      }
    }

    for (const { headerId, toUpdate, toInsert, valuesToDelete } of plan) {
      for (const { id, value } of toUpdate) {
        const encrypted = encryptText(value, userKey);
        await conn.query(
          `UPDATE techcoach_lite.techcoach_profile_swot_values
           SET header_value = ?
           WHERE id = ? AND user_id = ? AND header_id = ?`,
          [encrypted, id, userId, headerId],
        );
      }

      for (const value of toInsert) {
        const encrypted = encryptText(value, userKey);
        await conn.query(
          `INSERT INTO techcoach_lite.techcoach_profile_swot_values
             (user_id, header_id, header_value)
           VALUES (?, ?, ?)`,
          [userId, headerId, encrypted],
        );
      }

      if (valuesToDelete.length > 0) {
        await conn.query(
          `DELETE FROM techcoach_lite.techcoach_profile_swot_values
           WHERE id IN (?) AND user_id = ?`,
          [valuesToDelete, userId],
        );
      }
    }

    await conn.commit();
    res
      .status(200)
      .json({ message: "General Advanced Profile data updated successfully" });
  } catch (error) {
    console.error("Error updating general profile data:", error);
    if (conn) await conn.rollback();

    if (error?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "LINKED_VALUES",
        message:
          "Cannot remove value(s) because they are linked to an existing decision. Please unlink them first.",
      });
    }
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  } finally {
    if (conn) conn.release();
  }
}; */

const putAdvancedProfile = async (req, res) => {
  const { goals, values, resolutions, constraints, other_factors } = req.body;
  const userKey = req.user.key;
  const userId = req.user.id;

  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const headersAndValues = [
      { headerName: "Goals", headerValue: goals },
      { headerName: "Values", headerValue: values },
      { headerName: "Resolutions", headerValue: resolutions },
      { headerName: "Constraints", headerValue: constraints },
      { headerName: "OtherFactors", headerValue: other_factors },
    ];

    const safeDecrypt = (text) => {
      if (!text) return text;
      try { return decryptText(text, userKey); }
      catch { return null; }
    };

    const norm = (s) =>
      typeof s === "string" ? s.trim().replace(/\s+/g, " ") : "";

    const unwrapInsertId = (r) =>
      r?.insertId ??
      r?.[0]?.insertId ??
      (Array.isArray(r) ? r[0]?.insertId : undefined);

    const unwrapAffected = (r) =>
      r?.affectedRows ?? r?.[0]?.affectedRows ?? 0;

    const plan = [];

    for (const { headerName, headerValue } of headersAndValues) {
      if (!headerValue || headerValue.length === 0) continue;

      const headerRows = await conn.query(
        `SELECT header_id FROM techcoach_lite.techcoach_profile_swot_headers
         WHERE header_name = ? AND type_of_profile = 'Advanced_Profile'`,
        [headerName],
      );
      const headerId = headerRows[0]?.header_id;
      if (!headerId) throw new Error(`Header not found: ${headerName}`);

      const existingRows = await conn.query(
        `SELECT id, header_value
         FROM techcoach_lite.techcoach_profile_swot_values
         WHERE user_id = ? AND header_id = ? AND is_active = 1`,
        [userId, headerId],
      );

      const existingByNorm = new Map();
      for (const row of existingRows) {
        const plain = safeDecrypt(row.header_value);
        if (plain === null) continue;
        const key = norm(plain);
        if (key && !existingByNorm.has(key)) {
          existingByNorm.set(key, { id: row.id, plain: plain.trim() });
        }
      }

      const incoming = (Array.isArray(headerValue) ? headerValue : [headerValue])
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v !== "");
      const incomingByNorm = new Map(); // norm -> raw
      for (const v of incoming) {
        const k = norm(v);
        if (!incomingByNorm.has(k)) incomingByNorm.set(k, v);
      }

      const inPlaceUpdates = [];
      const inserts = [];
      const softDeletes = [];
      const linkedRemovals = [];

      for (const [k, raw] of incomingByNorm.entries()) {
        if (existingByNorm.has(k)) {
          const ex = existingByNorm.get(k);
          if (ex.plain === raw) continue;
          inPlaceUpdates.push({ id: ex.id, value: raw });
        } else {
          inserts.push(raw);
        }
      }

      for (const [k, ex] of existingByNorm.entries()) {
        if (incomingByNorm.has(k)) continue;
        softDeletes.push({ id: ex.id, plain: ex.plain });
      }

      plan.push({
        headerId,
        headerName,
        inPlaceUpdates,
        inserts,
        removals: softDeletes,
        linkedRemovals,
      });
    }

    const allRemovalIds = plan.flatMap((p) => p.removals.map((r) => r.id));
    const linkedInfoByOldId = new Map(); // oldId -> [ {decision_id, decision_name} ... ]
    if (allRemovalIds.length > 0) {
      const linkedRows = await conn.query(
        `SELECT l.v_id, l.decision_id, d.decision_name
         FROM techcoach_lite.techcoach_decision_swot_linked_info l
         LEFT JOIN techcoach_lite.techcoach_decision d
           ON d.decision_id = l.decision_id
         WHERE l.v_id IN (?)`,
        [allRemovalIds],
      );
      for (const r of linkedRows) {
        if (!linkedInfoByOldId.has(r.v_id)) linkedInfoByOldId.set(r.v_id, []);
        linkedInfoByOldId.get(r.v_id).push({
          decision_id: r.decision_id,
          decision_name: safeDecrypt(r.decision_name) || `Decision #${r.decision_id}`,
        });
      }
    }


    const versionPlan = [];
    const blocked = [];

    for (const p of plan) {
      const linked = [];
      const unlinked = [];
      for (const r of p.removals) {
        if (linkedInfoByOldId.has(r.id)) linked.push(r);
        else unlinked.push(r);
      }

      p.removals = unlinked;
      p.linkedRemovals = linked;

      const availableInserts = [...p.inserts];
      for (const r of linked) {
        if (availableInserts.length === 0) {
          blocked.push({
            v_id: r.id,
            header_name: p.headerName,
            plain: r.plain,
            decisions: linkedInfoByOldId.get(r.id) || [],
          });
        } else {
          const replacementValue = availableInserts.shift();
          versionPlan.push({
            oldId: r.id,
            headerId: p.headerId,
            headerName: p.headerName,
            replacementValue,
          });
        }
      }
      p.inserts = availableInserts;
    }

    if (blocked.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        error: "LINKED_VALUES",
        message:
          "Cannot remove value(s) that are linked to decisions unless you replace them " +
          "with a new value in the same section (an edit). To remove, unlink from the decision first.",
        linked: blocked.map((b) => ({
          v_id: b.v_id,
          v_header: b.plain,
          header_name: b.header_name,
          decisions: b.decisions,
        })),
      });
    }

    for (const p of plan) {
      for (const u of p.inPlaceUpdates) {
        await conn.query(
          `UPDATE techcoach_lite.techcoach_profile_swot_values
           SET header_value = ?
           WHERE id = ? AND user_id = ? AND header_id = ? AND is_active = 1`,
          [encryptText(u.value, userKey), u.id, userId, p.headerId],
        );
      }

      for (const value of p.inserts) {
        await conn.query(
          `INSERT INTO techcoach_lite.techcoach_profile_swot_values
             (user_id, header_id, header_value, is_active)
           VALUES (?, ?, ?, 1)`,
          [userId, p.headerId, encryptText(value, userKey)],
        );
      }

      if (p.removals.length > 0) {
        const ids = p.removals.map((r) => r.id);
        const r = await conn.query(
          `UPDATE techcoach_lite.techcoach_profile_swot_values
           SET is_active = 0
           WHERE id IN (?) AND user_id = ? AND is_active = 1`,
          [ids, userId],
        );
        if (unwrapAffected(r) === 0) {
          console.warn("[soft-delete] affected 0 rows for ids:", ids);
        }
      }
    }

    for (const v of versionPlan) {
      // 5a. insert new value
      const r = await conn.query(
        `INSERT INTO techcoach_lite.techcoach_profile_swot_values
           (user_id, header_id, header_value, is_active)
         VALUES (?, ?, ?, 1)`,
        [userId, v.headerId, encryptText(v.replacementValue, userKey)],
      );
      const newId = unwrapInsertId(r);
      if (!newId) {
        throw new Error(
          `Could not resolve insertId for replacement value in ${v.headerName}`,
        );
      }

      await conn.query(
        `INSERT INTO techcoach_lite.techcoach_profile_swot_linked_info
           (old_v_id, new_v_id, changed_by)
         VALUES (?, ?, ?)`,
        [v.oldId, newId, userId],
      );

      await conn.query(
        `UPDATE techcoach_lite.techcoach_decision_swot_linked_info
         SET v_id = ?
         WHERE v_id = ? AND user_id = ?`,
        [newId, v.oldId, userId],
      );

      await conn.query(
        `UPDATE techcoach_lite.techcoach_profile_swot_values
         SET is_active = 0
         WHERE id = ? AND user_id = ?`,
        [v.oldId, userId],
      );
    }

    await conn.commit();
    res
      .status(200)
      .json({ message: "Advanced Profile updated successfully" });
  } catch (error) {
    console.error("Error updating advanced profile:", error);
    if (conn) await conn.rollback();

    if (error?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "LINKED_VALUES",
        message:
          "Cannot remove value(s) linked to an existing decision. Unlink them first.",
      });
    }
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  } finally {
    if (conn) conn.release();
  }
};
module.exports = {
  getUserList,
  postAdvancedProfile,
  getMasterProfiles,
  getAdvancedProfile,
  putAdvancedProfile,
};
