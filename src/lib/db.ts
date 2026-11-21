import "server-only";
import postgres from "postgres";
import { SCHEMA_SQL, SEED_SQL } from "./schema";

declare global {
  var __memoireSql: postgres.Sql | undefined;
  var __memoireReady: Promise<void> | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  const local = /localhost|127\.0\.0\.1/.test(url);
  return postgres(url, {
    ssl: local ? false : "require",
    // Works with Supabase and Neon transaction poolers.
    prepare: false,
    onnotice: () => {},
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

/** Lazily created so builds don't need a database. Reused across hot reloads. */
function client(): postgres.Sql {
  if (!globalThis.__memoireSql) globalThis.__memoireSql = createClient();
  return globalThis.__memoireSql;
}

/**
 * Returns a ready client. The first call per server instance applies the
 * idempotent schema and seed, so a fresh database works with no manual step.
 */
export async function getSql(): Promise<postgres.Sql> {
  const sql = client();
  globalThis.__memoireReady ??= (async () => {
    await sql.unsafe(SCHEMA_SQL);
    const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from products`;
    if (count === 0) await sql.unsafe(SEED_SQL);
  })().catch((err) => {
    globalThis.__memoireReady = undefined; // retry on next request
    throw err;
  });
  await globalThis.__memoireReady;
  return sql;
}
