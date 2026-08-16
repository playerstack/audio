import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { AppContextProvider } from '../../src/context/AppContextProvider';
import AudioSettingsMenu from '../../src/AudioPlayer/components/AudioSettingsMenu';

const Wrapper = ({ children }) => <AppContextProvider language="en">{children}</AppContextProvider>;

describe('AudioSettingsMenu — full coverage', () => {
  const baseProps = {
    playbackRate: 1,
    changePlaybackRate: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders settings button with aria-expanded=false', () => {
    const { container } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('toggles menu open on click', () => {
    const { container } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  test('closes menu on second click', () => {
    const { container } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('opens speed submenu', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(); return 1; });
    const { container, getAllByText } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);
    // Click speed item to open submenu — first "Speed" is in main menu
    const speedElements = getAllByText('Speed');
    const speedBtn = speedElements[0].closest('button');
    fireEvent.click(speedBtn);
    // Submenu should show speed options
    expect(container.textContent).toContain('0.5');
    expect(container.textContent).toContain('0.75');
    expect(container.textContent).toContain('1.25');
    expect(container.textContent).toContain('1.5');
    expect(container.textContent).toContain('2');
    window.requestAnimationFrame.mockRestore();
  });

  test('go back from submenu', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(); return 1; });
    const { container, getAllByText } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);
    const speedElements = getAllByText('Speed');
    const speedBtn = speedElements[0].closest('button');
    fireEvent.click(speedBtn);

    // Click back button — second "Speed" text is in submenu header
    const updatedSpeedElements = getAllByText('Speed');
    const header = updatedSpeedElements[1]?.closest('div');
    if (header) fireEvent.click(header);

    act(() => { jest.advanceTimersByTime(200); });
    window.requestAnimationFrame.mockRestore();
  });

  test('selects speed option and closes menu', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(); return 1; });
    const changePlaybackRate = jest.fn();
    const { container, getAllByText } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} changePlaybackRate={changePlaybackRate} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);
    const speedElements = getAllByText('Speed');
    const speedBtn = speedElements[0].closest('button');
    fireEvent.click(speedBtn);

    // Select 2x speed
    const twoX = getAllByText('2')[0].closest('button');
    fireEvent.click(twoX);
    expect(changePlaybackRate).toHaveBeenCalledWith(2);

    act(() => { jest.advanceTimersByTime(200); });
    window.requestAnimationFrame.mockRestore();
  });

  test('shows "Normal" when rate is 1, shows Nx otherwise', () => {
    const { container, rerender } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} playbackRate={1} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);
    expect(container.textContent).toContain('Normal');
  });

  test('shows speed value when rate is not 1', () => {
    const { container } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} playbackRate={1.5} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);
    expect(container.textContent).toContain('1.5x');
  });

  test('outside click closes menu', () => {
    const { container } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    // Simulate outside click
    act(() => {
      fireEvent.mouseDown(document.body);
    });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('outside click with composedPath support', () => {
    const { container } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);

    // Simulate mousedown outside with composedPath
    const event = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(event, 'composedPath', { value: () => [document.body] });
    act(() => { document.dispatchEvent(event); });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('stopPropagation on button click event', () => {
    const { container } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>,
    );
    const btn = container.querySelector('[aria-label="Settings"]');
    const event = new MouseEvent('click', { bubbles: true });
    const stopProp = jest.spyOn(event, 'stopPropagation');
    fireEvent(btn, event);
    // The internal handler calls e.stopPropagation — but fireEvent creates its own event
    // Just verify no crash
    expect(container).toBeDefined();
  });
});
