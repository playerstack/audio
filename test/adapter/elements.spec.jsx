import { createRef } from 'react';
import { render } from '@testing-library/react';

import {
  PlayerstackElements,
  PlayerstackMediaController,
  PlayerstackAudioControls,
  PlayerstackVolume,
  PlayerstackSettings,
  PlayerstackChapters,
  PlayerstackAdOverlay,
  PlayerstackNavButtons,
} from '@adapter/elements';

// The representative audio-relevant tags this task calls out (Req 17.4). Each must
// be a defined React component (forwardRef object or function).
const REPRESENTATIVE_COMPONENTS = {
  PlayerstackMediaController,
  PlayerstackAudioControls,
  PlayerstackVolume,
  PlayerstackSettings,
  PlayerstackChapters,
  PlayerstackAdOverlay,
  PlayerstackNavButtons,
};

function isReactComponent(component) {
  const isFunction = typeof component === 'function';
  const isForwardRef = typeof component === 'object' && component !== null && '$$typeof' in component;
  return isFunction || isForwardRef;
}

describe('adapter/elements', () => {
  test('exports a component map keyed by PascalCase tag names', () => {
    expect(typeof PlayerstackElements).toBe('object');
    expect(PlayerstackElements).toHaveProperty('PlayerstackMediaController');
    expect(PlayerstackElements).toHaveProperty('PlayerstackAudioControls');
    expect(PlayerstackElements).toHaveProperty('PlayerstackVolume');
  });

  test('every entry in the map is a React component (forwardRef object or function)', () => {
    const values = Object.values(PlayerstackElements);
    expect(values.length).toBeGreaterThan(0);
    values.forEach((component) => {
      expect(isReactComponent(component)).toBe(true);
    });
  });

  test('named exports for the representative audio tags are defined components', () => {
    Object.entries(REPRESENTATIVE_COMPONENTS).forEach(([name, component]) => {
      expect(component).toBeDefined();
      expect(isReactComponent(component)).toBe(true);
      // Named export references the same component held in the map.
      expect(component).toBe(PlayerstackElements[name]);
    });
  });

  test('renders a representative element component to its custom element tag', () => {
    const ref = createRef();
    render(<PlayerstackAudioControls ref={ref} aria-label="Audio controls" />);
    const el = ref.current;
    expect(el).not.toBeNull();
    expect(el.tagName.toLowerCase()).toBe('playerstack-audio-controls');
    expect(el.getAttribute('aria-label')).toBe('Audio controls');
  });
});
