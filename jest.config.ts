import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testEnvironment: "node",
  rootDir: "src",
  restoreMocks: true,
  transform: {
    "\\.ts$": "ts-jest",
  },
};

export default config;
