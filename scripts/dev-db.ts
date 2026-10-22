// Local PostgreSQL for development, no install or admin rights needed:
// runs real PostgreSQL binaries shipped by the `embedded-postgres` package.
// Data lives in ./.postgres-data. Keep this running in its own terminal.
//
// Run:  npm run db          start (Ctrl+C to stop)
//       npm run db -- stop  stop a server left running in the background

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const PORT = 54329;
const DATABASE = "darna";
const dataDir = path.join(process.cwd(), ".postgres-data");
const pgCtl = path.join(
  process.cwd(),
  "node_modules/@embedded-postgres",
  `${process.platform === "win32" ? "windows" : process.platform}-${process.arch}`,
  "native/bin",
  process.platform === "win32" ? "pg_ctl.exe" : "pg_ctl",
);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
  // UTF-8 regardless of the Windows code page (Arabic text needs it).
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: () => {},
  onError: (message) => console.error(String(message).trim()),
});

function portInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

function stopBackgroundServer() {
  try {
    execFileSync(pgCtl, ["stop", "-D", dataDir, "-m", "fast"], { stdio: "inherit" });
  } catch {
    console.error("Could not stop the server (maybe it is not running).");
    process.exit(1);
  }
}

async function main() {
  if (process.argv[2] === "stop") return stopBackgroundServer();

  if (await portInUse(PORT)) {
    console.log(`Port ${PORT} is already in use — the local database is probably already running.`);
    console.log("You can use it as is. To stop it and start fresh here: npm run db -- stop");
    return;
  }

  const firstRun = !existsSync(path.join(dataDir, "PG_VERSION"));
  if (firstRun) {
    console.log("Creating local database cluster in .postgres-data …");
    await pg.initialise();
  }
  await pg.start();

  if (firstRun) await pg.createDatabase(DATABASE);

  console.log(`PostgreSQL is running on port ${PORT}.`);
  console.log(`DATABASE_URL="postgresql://postgres:postgres@localhost:${PORT}/${DATABASE}"`);
  console.log("Press Ctrl+C to stop.");

  const shutdown = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch(async (err: unknown) => {
  console.error("Could not start the local database.", err instanceof Error ? err.message : (err ?? ""));
  console.error("If it was stopped abruptly, try: npm run db -- stop   then run npm run db again.");
  await pg.stop().catch(() => {});
  process.exit(1);
});
