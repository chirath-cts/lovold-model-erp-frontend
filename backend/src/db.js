import path from "path";
import { fileURLToPath } from "url";

import sqlite3 from "sqlite3";
import { open } from "sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DB_PATH = path.resolve(__dirname, "../data/app.db");

export async function openDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec("PRAGMA foreign_keys = ON;");
  return db;
}
