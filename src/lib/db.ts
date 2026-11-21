import "server-only";
import postgres from "postgres";

declare global {
  var __memoireSql: postgres.Sql | undefined;
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
export function db(): postgres.Sql {
  if (!globalThis.__memoireSql) globalThis.__memoireSql = createClient();
  return globalThis.__memoireSql;
}
