const crypto = require("crypto");
const getConnection = require("./Models/database");

const NEW_SECRET = "f7f6786b51e7ff8264fc9b43cb46ecded3fcaf2bde1929bb9a90c0a6239a773c";

function encryptNew(text) {

  const key = crypto.createHash("sha256").update(NEW_SECRET).digest();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8");

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("hex");

}


function tryDecrypt(encryptedHex, possibleKeys) {

  for (const key of possibleKeys) {

    try {

      const decipher = crypto.createDecipher("aes-256-cbc", key);

      let decrypted = decipher.update(encryptedHex, "hex", "utf8");

      decrypted += decipher.final("utf8");

      return decrypted;

    } catch {}

  }

  return null;

}


async function migrateDecisionNames() {

  let conn;

  try {

    conn = await getConnection();

    const rows = await conn.query(`
      SELECT decision_id, decision_name, user_id
      FROM techcoach_lite.techcoach_decision
      WHERE decision_name IS NOT NULL
      AND decision_name_new IS NULL
    `);

    console.log(`Found ${rows.length} records`);

    for (const row of rows) {

      const userRows = await conn.query(`
        SELECT displayName, email, username
        FROM techcoach_lite.techcoach_users
        WHERE user_id = ?
      `, [row.user_id]);

      if (!userRows.length) continue;

      const user = userRows[0];

      const possibleKeys = [

        user.displayName + user.email,
        user.email,
        user.displayName,
        (user.username || "") + user.email,
        user.email.trim(),
        (user.displayName || "").trim() + user.email.trim()

      ].filter(Boolean);

      const decrypted = tryDecrypt(row.decision_name, possibleKeys);

      if (!decrypted) {

        console.log(`Failed decision_id ${row.decision_id}`);

        continue;

      }

      const newEncrypted = encryptNew(decrypted);

      await conn.query(`
        UPDATE techcoach_lite.techcoach_decision
        SET decision_name_new = ?
        WHERE decision_id = ?
      `, [newEncrypted, row.decision_id]);

      console.log(`Migrated decision_id ${row.decision_id}`);

    }

    console.log("Migration finished");

  } catch (err) {

    console.error(err);

  } finally {

    if (conn) conn.release();

  }

}

migrateDecisionNames();
