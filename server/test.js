const crypto = require("crypto");
const getConnection = require("./Models/database");

function decryptOld(encryptedHex, key) {
  try {
    const decipher = crypto.createDecipher("aes-256-cbc", key);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

async function test() {

  const conn = await getConnection();

  const rows = await conn.query(`
    SELECT d.decision_name, u.*
    FROM techcoach_lite.techcoach_decision d
    JOIN techcoach_lite.techcoach_users u ON u.user_id = d.user_id
    LIMIT 10
  `);

  for (const row of rows) {

    const possibleKeys = [

      row.email,
      row.username,
      row.displayName,

      row.email + row.username,
      row.username + row.email,

      row.email + row.displayName,
      row.displayName + row.email,

      row.user_id.toString(),

      crypto.createHash("sha256").update(row.email).digest("hex"),

      crypto.createHash("sha256").update(row.username || "").digest("hex"),

      crypto.createHash("sha256")
        .update(row.email + row.username)
        .digest("hex"),

      crypto.createHash("sha256")
        .update(row.email + "techcoach")
        .digest("hex"),

      crypto.createHash("sha256")
        .update(row.email + "secret")
        .digest("hex")

    ];

    for (const key of possibleKeys) {

      const result = decryptOld(row.decision_name, key);

      if (result) {

        console.log("\nSUCCESS");
        console.log("KEY:", key);
        console.log("DECRYPTED:", result);

        process.exit(0);

      }

    }

  }

  console.log("NO KEY MATCHED");

}

test();