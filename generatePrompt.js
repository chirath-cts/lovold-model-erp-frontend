import fs from "fs";
import path from "path";

console.log("Starting prompt generator...");

const rootDir = process.cwd();
const templatePath = path.join(rootDir, "ai", "prompt-template.md");

if (!fs.existsSync(templatePath)) {
  console.error(`Template not found: ${templatePath}`);
  process.exit(1);
}

const template = fs.readFileSync(templatePath, "utf-8");

const screenName = process.argv[2];

if (!screenName) {
  console.error("Please provide screen name");
  process.exit(1);
}

const screenPath = path.join(rootDir, "screens", screenName);

if (!fs.existsSync(screenPath)) {
  console.error(`Screen "${screenName}" not found: ${screenPath}`);
  process.exit(1);
}

const requiredFiles = ["screen.png", "code.html"];
const missingFiles = requiredFiles.filter(
  (file) => !fs.existsSync(path.join(screenPath, file))
);

if (missingFiles.length > 0) {
  console.warn(
    `Warning: Missing files in /screens/${screenName}: ${missingFiles.join(", ")}`
  );
}

const prompt = template.replaceAll("<screen-name>", screenName);

console.log("\nGenerated Prompt:\n");
console.log(prompt || "[Prompt is empty]");