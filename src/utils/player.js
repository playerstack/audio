import { lazy as ReactLazy } from 'react';

// Re-export framework-agnostic SDK utilities from @playerstack/core
export { getGlobal, getSDK, hasAudio, supportsWebKitPresentationMode } from '@playerstack/core';

/**
 * Enable stubbing on a function (test helper).
 */
export function enableStubOn(fn) {
  if (globalThis.__TEST__) {
    const wrap = (...args) => wrap.stub(...args);
    wrap.stub = fn;
    return wrap;
  }
  return fn;
}

/**
 * Lazy load a React component.
 */
export const lazy = (componentImportFn) => {
  return ReactLazy(async () => {
    const obj = await componentImportFn();
    return typeof obj.default === 'function' ? obj : obj.default;
  });
};
