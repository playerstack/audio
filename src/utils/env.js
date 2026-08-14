/**
 * Detect if running in a test environment (Jest, jsdom, etc.)
 * Used to disable features that don't work in synthetic DOM (e.g. Shadow DOM).
 */
export const isTestEnv =
  typeof globalThis !== 'undefined' &&
  (globalThis.__TEST__ ||
    (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') ||
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('jsdom')));
