import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { AppContextProvider } from '../../src/context/AppContextProvider';
import AudioSettingsMenu from '../../src/AudioPlayer/components/AudioSettingsMenu';

const Wrapper = ({ children }) => <AppContextProvider language="en">{children}</AppContextProvider>;

describe('AudioSettingsMenu', () => {
  const baseProps = {
    playbackRate: 1,
    changePlaybackRate: jest.fn(),
  };

  test('renders settings button', () => {
    const { container } = render(<Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>);
    expect(container.querySelector('[aria-label="Settings"]')).toBeInTheDocument();
  });

  test('opens menu on click', () => {
    const { container } = render(<Wrapper><AudioSettingsMenu {...baseProps} /></Wrapper>);
    const btn = container.querySelector('[aria-label="Settings"]');
    fireEvent.click(btn);
    // Menu should now be visible (contains speed options)
    expect(container.textContent).toContain('Normal');
  });

  test('calls changePlaybackRate when option selected', () => {
    const changePlaybackRate = jest.fn();
    const { container, getByText } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} changePlaybackRate={changePlaybackRate} /></Wrapper>,
    );
    fireEvent.click(container.querySelector('[aria-label="Settings"]'));
    fireEvent.click(getByText('1.5'));
    expect(changePlaybackRate).toHaveBeenCalledWith(1.5);
  });

  test('shows current rate as active', () => {
    const { container } = render(
      <Wrapper><AudioSettingsMenu {...baseProps} playbackRate={1.5} /></Wrapper>,
    );
    fireEvent.click(container.querySelector('[aria-label="Settings"]'));
    expect(container.textContent).toContain('1.5');
  });
});
