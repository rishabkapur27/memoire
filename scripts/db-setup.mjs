// Applies db/schema.sql and db/seed.sql to DATABASE_URL.
// Usage: npm run db:setup   (reads .env.local / .env if present)
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import postgres from "postgres";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(path.join(root, file));
  } catch {
    // file is optional
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const local = /localhost|127\.0\.0\.1/.test(url);
const sql = postgres(url, { ssl: local ? false : "require", prepare: false, max: 1, onnotice: () => {} });

try {
  for (const name of ["schema.sql", "seed.sql"]) {
    const text = await readFile(path.join(root, "db", name), "utf8");
    await sql.unsafe(text);
    console.log(`Applied db/${name}`);
  }
  const [{ count }] = await sql`select count(*)::int as count from products`;
  console.log(`Done. ${count} products in the menu.`);
} catch (err) {
  console.error("Database setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
