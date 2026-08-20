import React from 'react';
import PropTypes from 'prop-types';

import { settingsIcon, arrowLeftIcon, arrowRightIcon } from '@playerstack/core/icons';
import Icon from '@components/Icon';
import Tooltip from '@Commons/Tooltip';
import { buildIconProps } from '@playerstack/core';
import { useAppSelector } from '@context/index';

import {
  StyledSettingsContainer,
  StyledSettingsButton,
  StyledMenuOverlay,
  StyledMenuList,
  StyledMenuItem,
  StyledMenuItemTitle,
  StyledMenuItemValue,
  StyledSubMenuOverlay,
  StyledSubMenuHeader,
  StyledSubMenuContent,
  StyledSubMenuList,
  StyledSubMenuItem,
} from '@AudioPlayer/components/AudioSettingsMenu/AudioSettingsMenu.styled.jsx';

const SPEED_OPTIONS = [2, 1.5, 1.25, 1, 0.75, 0.5];

const AudioSettingsMenu = ({ playbackRate, changePlaybackRate }) => {
  const containerRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [subMenuOpen, setSubMenuOpen] = React.useState(false);
  const [subMenuReady, setSubMenuReady] = React.useState(false);
  const { i18n } = useAppSelector();
  const iconProps = buildIconProps();

  // Toggle main menu
  const handleButtonClick = React.useCallback((e) => {
    e.stopPropagation();
    setMenuOpen((prev) => {
      if (prev) {
        setSubMenuOpen(false);
        setSubMenuReady(false);
      }
      return !prev;
    });
  }, []);

  // Open speed submenu
  const handleOpenSpeed = React.useCallback(() => {
    setSubMenuOpen(true);
    requestAnimationFrame(() => setSubMenuReady(true));
  }, []);

  // Go back to main menu
  const handleGoBack = React.useCallback(() => {
    setSubMenuReady(false);
    setTimeout(() => setSubMenuOpen(false), 150);
  }, []);

  // Select speed
  const handleSpeedSelect = React.useCallback(
    (speed) => {
      changePlaybackRate(speed);
      setSubMenuReady(false);
      setTimeout(() => {
        setSubMenuOpen(false);
        setMenuOpen(false);
      }, 150);
    },
    [changePlaybackRate],
  );

  // Close on outside click (uses composedPath for Shadow DOM compatibility)
  React.useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (!containerRef.current) return;
      const path = e.composedPath ? e.composedPath() : [];
      const isInside = path.includes(containerRef.current) || containerRef.current.contains(e.target);
      if (!isInside) {
        setMenuOpen(false);
        setSubMenuOpen(false);
        setSubMenuReady(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const speedLabel = playbackRate === 1 ? i18n.normal : `${playbackRate}x`;

  return (
    <StyledSettingsContainer ref={containerRef}>
      <Tooltip label={i18n.settings}>
        <StyledSettingsButton
          type="button"
          aria-label={i18n.settings}
          aria-expanded={menuOpen}
          onClick={handleButtonClick}
          $expanded={menuOpen}
        >
          <Icon icon={settingsIcon} {...iconProps} />
        </StyledSettingsButton>
      </Tooltip>

      {/* Main menu */}
      <StyledMenuOverlay $visible={menuOpen && !subMenuOpen}>
        <StyledMenuList>
          <StyledMenuItem>
            <button type="button" onClick={handleOpenSpeed}>
              <StyledMenuItemTitle>{i18n.speed}</StyledMenuItemTitle>
              <StyledMenuItemValue>
                {speedLabel}
                <Icon icon={arrowRightIcon} width={20} height={20} />
              </StyledMenuItemValue>
            </button>
          </StyledMenuItem>
        </StyledMenuList>
      </StyledMenuOverlay>

      {/* Speed submenu */}
      <StyledSubMenuOverlay $visible={subMenuOpen}>
        <StyledSubMenuHeader onClick={handleGoBack}>
          <Icon icon={arrowLeftIcon} width={16} height={16} />
          {i18n.speed}
        </StyledSubMenuHeader>
        <StyledSubMenuContent $show={subMenuReady}>
          <StyledSubMenuList>
            {SPEED_OPTIONS.map((speed) => (
              <StyledSubMenuItem key={speed} $selected={playbackRate === speed}>
                <button type="button" onClick={() => handleSpeedSelect(speed)}>
                  {speed === 1 ? i18n.normal : `${speed}`}
                </button>
              </StyledSubMenuItem>
            ))}
          </StyledSubMenuList>
        </StyledSubMenuContent>
      </StyledSubMenuOverlay>
    </StyledSettingsContainer>
  );
};

AudioSettingsMenu.propTypes = {
  playbackRate: PropTypes.number.isRequired,
  changePlaybackRate: PropTypes.func.isRequired,
};

export default React.memo(AudioSettingsMenu);
