import React, { Suspense } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { lazy } from '../../src/utils/player';

describe('lazy — full coverage', () => {
  test('returns a React.lazy-like component', () => {
    const LazyComp = lazy(() => Promise.resolve({ default: () => null }));
    expect(LazyComp).toBeDefined();
    expect(LazyComp.$$typeof).toBeDefined();
  });

  test('resolves module with default as function', async () => {
    const MyComp = () => <div data-testid="lazy-comp">Hello</div>;
    const LazyComp = lazy(() => Promise.resolve({ default: MyComp }));

    let container;
    await act(async () => {
      const result = render(
        <Suspense fallback={<div>Loading</div>}>
          <LazyComp />
        </Suspense>,
      );
      container = result.container;
    });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="lazy-comp"]')).toBeInTheDocument();
    });
  });

  test('resolves module with default NOT a function (nested default)', async () => {
    const MyComp = () => <div data-testid="nested-comp">Nested</div>;
    const LazyComp = lazy(() => Promise.resolve({ default: { default: MyComp } }));

    let container;
    await act(async () => {
      const result = render(
        <Suspense fallback={<div>Loading</div>}>
          <LazyComp />
        </Suspense>,
      );
      container = result.container;
    });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="nested-comp"]')).toBeInTheDocument();
    });
  });
});
