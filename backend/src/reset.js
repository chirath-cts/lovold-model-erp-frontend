import fs from "fs";

import { DB_PATH, openDb } from "./db.js";
import { initializeSchema, seedDatabase } from "./init.js";

async function reset() {
  if (fs.existsSync(DB_PATH)) {
    fs.rmSync(DB_PATH);
  }

  const db = await openDb();
  await initializeSchema(db);
  await seedDatabase(db, { forceReset: true });
  await db.close();

  console.log(`Database reset and reseeded at ${DB_PATH}`);
}

reset().catch((error) => {
  console.error(error);
  process.exit(1);
});
