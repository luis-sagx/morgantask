module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  clearMocks: true,
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/server.ts",
    "!src/infrastructure/config/**",
    "!src/infrastructure/models/**",
    "!src/infrastructure/container.ts",
    "!src/interfaces/routes/**",
    "!src/domain/**",
  ],
};