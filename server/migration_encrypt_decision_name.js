const crypto = require("crypto");
const getConnection = require("./Models/database");

function decryptOld(encryptedHex, key) {

  try {

    const decipher = crypto.createDecipher(
      "aes-256-cbc",
      Buffer.from(key, "utf8")
    );

    let decrypted = decipher.update(
      encryptedHex,
      "hex",
      "utf8"
    );

    decrypted += decipher.final("utf8");

    return decrypted;

  }
  catch (err) {

    console.log("Decrypt failed with key:", key);

    return null;

  }

}

async function testDecrypt() {

  const conn = await getConnection();

  const rows = await conn.query(`
    SELECT 
      d.decision_id,
      d.decision_name,
      u.displayName,
      u.email
    FROM techcoach_lite.techcoach_decision d
    JOIN techcoach_lite.techcoach_users u
    ON d.user_id = u.user_id
    LIMIT 2
  `);

  for (const row of rows) {

    const key =
      (row.displayName || "").trim() +
      (row.email || "").trim();

    console.log("\nTesting decision:", row.decision_id);

    const decrypted =
      decryptOld(row.decision_name, key);

    console.log("Result:", decrypted);

  }

  conn.release();

}

testDecrypt();