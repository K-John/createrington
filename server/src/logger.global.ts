import loggerInstance from "./logger";

declare global {
  var logger: typeof loggerInstance;
}

global.logger = loggerInstance;

export {};
