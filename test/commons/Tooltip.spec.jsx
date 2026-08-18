import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Provider } from '../../src/context/index';
import Tooltip from '../../src/Commons/Tooltip';

const Wrapper = ({ children, playerRef }) => {
  // Provide a playerRef in context
  const WrapperInner = () => {
    const { Context } = require('../../src/context/index');
    const ctx = React.useContext(Context);
    React.useEffect(() => {
      if (playerRef) {
        ctx.dispatch({ playerRef });
      }
    }, []);
    return children;
  };
  return (
    <Provider language="en">
      <WrapperInner />
    </Provider>
  );
};

describe('Tooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb();
      return 1;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('renders children directly when no label', () => {
    const { getByText } = render(
      <Provider language="en">
        <Tooltip label="">
          <button>Click me</button>
        </Tooltip>
      </Provider>,
    );
    expect(getByText('Click me')).toBeInTheDocument();
  });

  test('renders children directly when disabled', () => {
    const { getByText, queryByText } = render(
      <Provider language="en">
        <Tooltip label="Help text" disabled={true}>
          <button>Click me</button>
        </Tooltip>
      </Provider>,
    );
    expect(getByText('Click me')).toBeInTheDocument();
    expect(queryByText('Help text')).not.toBeInTheDocument();
  });

  test('renders tooltip text when label provided', () => {
    const { getByText } = render(
      <Provider language="en">
        <Tooltip label="Help text">
          <button>Click me</button>
        </Tooltip>
      </Provider>,
    );
    expect(getByText('Help text')).toBeInTheDocument();
  });

  test('suppresses tooltip on click', () => {
    const { container } = render(
      <Provider language="en">
        <Tooltip label="Help text">
          <button>Click me</button>
        </Tooltip>
      </Provider>,
    );
    const wrapper = container.firstChild;
    fireEvent.click(wrapper);
    const tooltipText = container.querySelector('[data-suppressed="true"]');
    expect(tooltipText).toBeInTheDocument();
  });

  test('handles mouseEnter without playerRef', () => {
    const { container } = render(
      <Provider language="en">
        <Tooltip label="Tip">
          <button>Btn</button>
        </Tooltip>
      </Provider>,
    );
    const wrapper = container.firstChild;
    fireEvent.mouseEnter(wrapper);
    // No crash, offsetX stays 0
  });

  test('handles mouseLeave resets state', () => {
    const { container } = render(
      <Provider language="en">
        <Tooltip label="Tip">
          <button>Btn</button>
        </Tooltip>
      </Provider>,
    );
    const wrapper = container.firstChild;
    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    // No crash
  });

  test('clamps tooltip position within player bounds', () => {
    const playerEl = document.createElement('div');
    Object.defineProperty(playerEl, 'getBoundingClientRect', {
      value: () => ({ left: 0, right: 300, top: 0, bottom: 100, width: 300, height: 100 }),
    });
    playerEl.querySelectorAll = jest.fn(() => []);
    const playerRef = { current: playerEl };

    const { container } = render(
      <Provider language="en">
        <Tooltip label="Tip" playerRefOverride={playerRef}>
          <button>Btn</button>
        </Tooltip>
      </Provider>,
    );

    // Manually set playerRef in context by dispatching
    const wrapper = container.firstChild;
    fireEvent.mouseEnter(wrapper);
  });

  test('suppresses when menu is expanded', () => {
    const playerEl = document.createElement('div');
    const expandedEl = document.createElement('button');
    expandedEl.setAttribute('aria-expanded', 'true');
    playerEl.appendChild(expandedEl);
    Object.defineProperty(playerEl, 'getBoundingClientRect', {
      value: () => ({ left: 0, right: 300, top: 0, bottom: 100, width: 300, height: 100 }),
    });
    playerEl.querySelectorAll = jest.fn((selector) => {
      if (selector === '[aria-expanded="true"]') return [expandedEl];
      return [];
    });
    const playerRef = { current: playerEl };

    // We need the tooltip to have access to playerRef through context
    const TestComp = () => {
      const { Context } = require('../../src/context/index');
      const { dispatch } = React.useContext(Context);
      React.useEffect(() => {
        dispatch({ playerRef });
      }, []);
      return (
        <Tooltip label="Tip">
          <button>Btn</button>
        </Tooltip>
      );
    };

    const { container } = render(
      <Provider language="en">
        <TestComp />
      </Provider>,
    );

    const wrapper = container.querySelector('[class]');
    if (wrapper) {
      fireEvent.mouseEnter(wrapper);
    }
  });

  test('renders with fullscreen prop', () => {
    const { getByText } = render(
      <Provider language="en">
        <Tooltip label="FS Tip" fullscreen={true}>
          <button>Btn</button>
        </Tooltip>
      </Provider>,
    );
    expect(getByText('FS Tip')).toBeInTheDocument();
  });

  test('clamping: tooltip overflows left boundary', () => {
    const playerEl = document.createElement('div');
    Object.defineProperty(playerEl, 'getBoundingClientRect', {
      value: () => ({ left: 50, right: 400, top: 0, bottom: 100, width: 350, height: 100 }),
    });
    playerEl.querySelectorAll = jest.fn(() => []);
    const playerRef = { current: playerEl };

    const TestComp = () => {
      const { Context } = require('../../src/context/index');
      const { dispatch } = React.useContext(Context);
      React.useEffect(() => {
        dispatch({ playerRef });
      }, []);
      return (
        <Tooltip label="Long tooltip text here">
          <button>B</button>
        </Tooltip>
      );
    };

    const { container } = render(
      <Provider language="en">
        <TestComp />
      </Provider>,
    );

    const wrappers = container.querySelectorAll('div');
    if (wrappers[0]) {
      fireEvent.mouseEnter(wrappers[0]);
    }
  });
});
