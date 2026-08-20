const path = require('path');
const fs = require('fs');

// Always consume core's built CJS output (same as the published package / CI).
// The dev workspace symlinks node_modules/@playerstack/core → ../core, so rebuilding
// core keeps this fresh. Resolving to dist avoids transforming core's TypeScript
// with esbuild-jest (which trips on `export type` re-exports).
const distCoreCjs = path.resolve(__dirname, '../core/dist/cjs');
const hasLocalCore = fs.existsSync(distCoreCjs);

function corePath(subpath) {
  if (hasLocalCore) {
    return path.join(distCoreCjs, subpath + '.js');
  }
  return path.join(__dirname, 'node_modules/@playerstack/core/dist/cjs', subpath + '.js');
}

module.exports = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'esbuild-jest',
      { sourcemap: true, loaders: { '.js': 'js', '.jsx': 'jsx', '.ts': 'ts', '.tsx': 'tsx' } },
    ],
  },
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/test/setupTests.js'],
  coverageReporters: ['lcov', 'json', 'clover', 'text'],
  coveragePathIgnorePatterns: ['node_modules', 'lib', 'scripts', 'types', 'coverage'],
  reporters: ['default', ['jest-junit', { outputDirectory: 'coverage', outputName: 'report.xml' }]],
  testMatch: ['<rootDir>/test/**/*.spec.(js|jsx)'],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom(.*)$': '<rootDir>/node_modules/react-dom$1',
    '^@playerstack/core/patterns$': corePath('patterns'),
    '^@playerstack/core/chapters$': corePath('chapters'),
    '^@playerstack/core/heatmap$': corePath('heatmap'),
    '^@playerstack/core/i18n$': corePath('i18n/index'),
    '^@playerstack/core/keyboard$': corePath('keyboard'),
    '^@playerstack/core/live-dvr$': corePath('live-dvr'),
    '^@playerstack/core/slider$': corePath('slider'),
    '^@playerstack/core/player-state$': corePath('player-state'),
    '^@playerstack/core/quality$': corePath('quality'),
    '^@playerstack/core/reducer$': corePath('reducer'),
    '^@playerstack/core/ui$': corePath('ui'),
    '^@playerstack/core/engine$': corePath('media-engine'),
    '^@playerstack/core/adapters$': corePath('types/adapters.types'),
    '^@playerstack/core/utils/format$': corePath('utils/format'),
    '^@playerstack/core/utils/cookie$': corePath('utils/cookie'),
    '^@playerstack/core/utils/device$': corePath('utils/device'),
    '^@playerstack/core/utils/sdk$': corePath('utils/sdk'),
    '^@playerstack/core/utils/media$': corePath('utils/media'),
    '^@playerstack/core/utils/env$': corePath('utils/env'),
    '^@playerstack/core/utils/captions$': corePath('utils/captions'),
    '^@playerstack/core/utils/vtt-sprite$': corePath('utils/vtt-sprite'),
    '^@playerstack/core/constants$': corePath('constants'),
    '^@playerstack/core/icons/mobile$': corePath('icons/mobile/index'),
    '^@playerstack/core/icons$': corePath('icons/index'),
    '^@playerstack/core$': '<rootDir>/test/__mocks__/core.js',
    '^@playerstack/core/(.*)$': '<rootDir>/test/__mocks__/core.js',
  },
  resolver: '<rootDir>/jest.resolver.js',
};
