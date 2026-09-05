import "dotenv/config";
import { execFileSync } from "node:child_process";
import { URL } from "node:url";
import pg from "pg";

const { Client } = pg;

function getDatabaseUrl(name: string): URL {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set.`);
  }

  try {
    return new URL(value);
  } catch {
    throw new Error(`${name} is not a valid PostgreSQL connection URL.`);
  }
}

function getAdminUrl(databaseUrl: URL): string {
  if (process.env.DATABASE_ADMIN_URL) {
    return process.env.DATABASE_ADMIN_URL;
  }

  const adminUrl = new URL(databaseUrl.toString());
  adminUrl.pathname = "/postgres";
  adminUrl.username = process.env.POSTGRES_USER || "postgres";
  adminUrl.password = process.env.POSTGRES_PASSWORD || databaseUrl.password;

  if (!adminUrl.password) {
    throw new Error("Set DATABASE_ADMIN_URL or POSTGRES_PASSWORD for PostgreSQL administration.");
  }

  return adminUrl.toString();
}

function runPrisma(...args: string[]) {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  execFileSync(command, ["--no-install", "prisma", ...args], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
}

function sleepSync(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * On Windows, `prisma generate` fails with EPERM if the previously generated
 * query engine DLL is still loaded by another running process (a `dev`
 * server or an open `prisma studio` session). That lock is often transient,
 * so retry a few times before giving up with actionable guidance instead of
 * a raw Prisma stack trace.
 */
function runPrismaGenerate(maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      runPrisma("generate");
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(
          "Prisma Client generation failed, most likely because the previously generated query engine is " +
            "still locked by another running process. On Windows this happens when a dev server " +
            "(`npm run dev` / `npm run dev:api`) or `npx prisma studio` is left running. Stop those processes " +
            `and re-run "npm run db:setup". Original error: ${reason}`,
        );
      }
      console.warn(`Prisma Client generation failed (attempt ${attempt}/${maxAttempts}); retrying in 1.5s...`);
      sleepSync(1500);
    }
  }
}

async function main() {
  const databaseUrl = getDatabaseUrl("DATABASE_URL");
  const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));

  if (!databaseName) {
    throw new Error("DATABASE_URL must include a target database name.");
  }

  const adminClient = new Client({ connectionString: getAdminUrl(databaseUrl) });

  console.log("Checking PostgreSQL connectivity...");
  await adminClient.connect();

  try {
    const result = await adminClient.query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
      [databaseName],
    );

    if (!result.rows[0]?.exists) {
      console.log(`Creating database ${databaseName}...`);
      await adminClient.query(`CREATE DATABASE "${databaseName.replaceAll('"', '""')}"`);
    } else {
      console.log(`Database ${databaseName} already exists.`);
    }
  } finally {
    await adminClient.end();
  }

  console.log("Applying Prisma migrations...");
  runPrisma("migrate", "deploy");
  console.log("Generating Prisma Client...");
  runPrismaGenerate();
  console.log("Running Prisma seed...");
  runPrisma("db", "seed");
  console.log("Database setup completed successfully.");
}

main().catch((error) => {
  console.error("Database setup failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});