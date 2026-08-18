import React from 'react';
import { render } from '@testing-library/react';
import {
  StyledSettingsPanel,
  StyledSettingsItem,
} from '@AudioPlayer/AudioPlayerSkin.styled';

describe('AudioPlayerSkin.styled — branch coverage for unused exports', () => {
  test('StyledSettingsPanel visible=true renders block', () => {
    const { container } = render(<StyledSettingsPanel $visible={true}>Content</StyledSettingsPanel>);
    expect(container.firstChild).toHaveStyle('display: block');
  });

  test('StyledSettingsPanel visible=false renders none', () => {
    const { container } = render(<StyledSettingsPanel $visible={false}>Content</StyledSettingsPanel>);
    expect(container.firstChild).toHaveStyle('display: none');
  });

  test('StyledSettingsItem active=true has background', () => {
    const { container } = render(<StyledSettingsItem $active={true}>Item</StyledSettingsItem>);
    expect(container.firstChild).toHaveStyle('background: rgba(255, 255, 255, 0.08)');
  });

  test('StyledSettingsItem active=false is transparent', () => {
    const { container } = render(<StyledSettingsItem $active={false}>Item</StyledSettingsItem>);
    expect(container.firstChild).toHaveStyle('background: transparent');
  });
});
