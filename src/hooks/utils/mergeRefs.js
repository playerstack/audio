/**
 * Merge an array of refs into a single callback ref.
 * Handles callback refs (functions), object refs (React.createRef / useRef),
 * and skips null/undefined entries.
 *
 * @param {Array} refs - Array of refs to merge.
 * @returns {function} A callback ref that assigns the value to every ref in the array.
 */
export function mergeRefs(refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    });
  };
}
