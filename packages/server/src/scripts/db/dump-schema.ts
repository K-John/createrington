import "@/logger.global";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "@/config";

const poolConfig = config.database.pool;

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function dumpSchema() {
  const outputFile = path.resolve(
    __dirname,
    "../../../../../db/schema/init.sql",
  );

  const command = `pg_dump -h ${poolConfig.host} -U ${poolConfig.user} -d ${poolConfig.database} --schema-only -f ${outputFile}`;

  try {
    console.log("Dumping database schema...");
    const { stdout, stderr } = await execAsync(command, {
      env: {
        ...process.env,
        PGPASSWORD: poolConfig.password,
      },
    });

    if (stderr) {
      console.log("Warnings:", stderr);
    }

    console.log("Schema dumped successfully to:");
    console.log(`   ${outputFile}`);
    process.exit(0);
  } catch (error) {
    logger.error("Failed to dupm schema:", error);
    process.exit(1);
  }
}

dumpSchema();
