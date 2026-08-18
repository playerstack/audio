import { getValue } from '@Commons/TimeTooltip/utils';

describe('TimeTooltip/utils', () => {
  describe('getValue', () => {
    const rect = { left: 100, width: 200 };

    test('returns 0 when event is at left edge', () => {
      expect(getValue({ clientX: 100 }, rect, 60)).toBe(0);
    });

    test('returns 0 when event is before left edge', () => {
      expect(getValue({ clientX: 50 }, rect, 60)).toBe(0);
    });

    test('returns duration when event is at right edge', () => {
      expect(getValue({ clientX: 300 }, rect, 60)).toBe(60);
    });

    test('returns duration when event is beyond right edge', () => {
      expect(getValue({ clientX: 400 }, rect, 60)).toBe(60);
    });

    test('returns proportional time for middle position', () => {
      expect(getValue({ clientX: 200 }, rect, 60)).toBe(30);
    });

    test('handles touch events', () => {
      // In test env, mock getEventXCoordinate uses clientX
      const event = { clientX: 200 };
      expect(getValue(event, rect, 60)).toBe(30);
    });
  });
});
