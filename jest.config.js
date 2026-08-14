module.exports = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  transform: {
    "^.+\\.(js|jsx)$": ["esbuild-jest", { sourcemap: true, loaders: { ".js": "js", ".jsx": "jsx" } }],
  },
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  moduleFileExtensions: ["js", "jsx"],
  testEnvironment: "jest-environment-jsdom",
  setupFiles: ["<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-dom", "<rootDir>/test/setupTests.js"],
  coverageReporters: ["lcov", "json", "clover", "text"],
  coveragePathIgnorePatterns: ["node_modules", "lib", "scripts", "types", "coverage"],
  reporters: ["default", ["jest-junit", { outputDirectory: "coverage", outputName: "report.xml" }]],
  testMatch: ["<rootDir>/test/**/*.spec.(js|jsx)"],
  moduleNameMapper: {
    "^@playerstack/core$": "<rootDir>/test/__mocks__/core.js",
    "^@playerstack/core/(.*)$": "<rootDir>/test/__mocks__/core.js",
  },
};
