import { omit as coreOmit } from '@playerstack/core';

/**
 * Omit keys from an object. Accepts multiple arrays of keys (variadic).
 */
export function omit(object, ...arrays) {
  const keys = [].concat(...arrays);
  return coreOmit(object, keys);
}
