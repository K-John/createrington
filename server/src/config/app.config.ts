import { env } from "./env/env.config";

export interface AppConfig {
  port: number;
}

const config: AppConfig = {
  port: env.PORT,
};

export default config;
