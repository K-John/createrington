process.env.VALIDATION_MODE = "generation";

import { beforeAll, afterAll } from "vitest";
import "@/logger.global";

beforeAll(async () => {
  logger.info("Test suite stating...");
});

afterAll(async () => {
  logger.info("Test suite finished");
});
