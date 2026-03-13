import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFolder = path.join(__dirname, "data");
const outputFile = path.join(__dirname, "db.json");

let db = {};

for (const file of fs.readdirSync(dataFolder)) {
  const filePath = path.join(dataFolder, file);
  try {
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    db = { ...db, ...json };
  } catch (err) {
    console.error(`Error parsing ${file}:`, err.message);
  }
}

fs.writeFileSync(outputFile, JSON.stringify(db, null, 2));

console.log("Mock DB generated successfully");
