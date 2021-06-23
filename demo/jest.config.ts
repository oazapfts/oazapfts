import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^oazapfts/lib/(.+)$": "<rootDir>/../src/$1",
  },
  restoreMocks: true,
};

export default config;
