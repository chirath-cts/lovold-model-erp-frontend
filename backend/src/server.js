import express from "express";
import cors from "cors";

import { createDependencies } from "./app/createDependencies.js";
import { registerRoutes } from "./app/registerRoutes.js";
import { openDb } from "./db.js";
import { initializeSchema, seedDatabase } from "./init.js";

const PORT = Number(process.env.PORT || 4001);

async function start() {
  const db = await openDb();
  await initializeSchema(db);
  const result = await seedDatabase(db, { forceReset: false });

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  const { services } = createDependencies({ db });
  registerRoutes(app, services);

  app.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
    console.log(
      result.seeded
        ? "Database seeded from mock/db.json"
        : "Database already initialized; keeping persisted data",
    );
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
