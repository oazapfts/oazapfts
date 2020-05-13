module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["js", "ts"],
  moduleNameMapper: {
    "^oazapfts/lib/(.+)$": "<rootDir>/../src/$1",
  },
  restoreMocks: true,
  transform: {
    "\\.ts$": "ts-jest",
  },
};
