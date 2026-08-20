import { lazy } from '@hooks/utils/lazy';

describe('lazy', () => {
  test('returns a React.lazy component', () => {
    const LazyComp = lazy(() => Promise.resolve({ default: () => null }));
    expect(LazyComp).toBeDefined();
    expect(LazyComp.$$typeof).toBeDefined(); // React internal symbol
  });

  test('handles module with default export', async () => {
    const mockComponent = () => 'test';
    const LazyComp = lazy(() => Promise.resolve({ default: mockComponent }));
    expect(LazyComp).toBeDefined();
  });
});
