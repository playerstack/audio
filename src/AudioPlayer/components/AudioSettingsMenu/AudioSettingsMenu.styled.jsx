import React from 'react';
import styled from 'styled-components';

export const StyledSettingsContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

export const StyledSettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }

  & svg {
    transition: transform 0.2s ease-in-out;
    transform: ${({ $expanded }) => ($expanded ? 'rotate(45deg)' : 'rotate(0)')};
  }

  & * {
    pointer-events: none;
  }
`;

/* Main menu overlay */
const MenuOverlay = React.forwardRef(({ $visible, ...rest }, ref) => <div ref={ref} {...rest} />);
MenuOverlay.displayName = 'MenuOverlay';

export const StyledMenuOverlay = styled(MenuOverlay)`
  position: absolute;
  bottom: 55px;
  right: 0;
  min-width: 250px;
  background: rgba(20, 20, 20, 0.97);
  overflow: hidden;
  z-index: 99999;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.4;
`;

export const StyledMenuList = styled.ul`
  padding: 10px 0;
`;

export const StyledMenuItem = styled.li`
  & > button {
    display: flex;
    align-items: center;
    width: 100%;
    height: 48px;
    padding: 0 24px;
    border: none;
    background: transparent;
    color: #eee;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
  }
`;

export const StyledMenuItemTitle = styled.span`
  margin-right: auto;
`;

export const StyledMenuItemValue = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 87%;
  color: #fff;
`;

/* Submenu overlay (speed list) */
const SubMenuOverlay = React.forwardRef(({ $visible, ...rest }, ref) => <div ref={ref} {...rest} />);
SubMenuOverlay.displayName = 'SubMenuOverlay';

export const StyledSubMenuOverlay = styled(SubMenuOverlay)`
  position: absolute;
  bottom: 55px;
  right: 0;
  width: 250px;
  max-height: 250px;
  overflow-y: auto;
  background: rgba(20, 20, 20, 0.97);
  z-index: 99999;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.4;

  &::-webkit-scrollbar {
    width: 8px;
    background-color: #4c4c4c;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #909090;
    border-radius: 10px;
  }
`;

export const StyledSubMenuHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  position: sticky;
  top: 0;
  background: rgba(20, 20, 20, 0.97);
  z-index: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  & svg {
    opacity: 0.7;
  }
`;

export const StyledSubMenuContent = styled.div`
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transform: ${({ $show }) => ($show ? 'translateX(0)' : 'translateX(50px)')};
  transition:
    opacity 0.15s linear,
    transform 0.15s ease-out;
`;

export const StyledSubMenuList = styled.ul`
  padding: 8px 0;
`;

const SubMenuItem = React.forwardRef(({ $selected, ...rest }, ref) => <li ref={ref} {...rest} />);
SubMenuItem.displayName = 'SubMenuItem';

export const StyledSubMenuItem = styled(SubMenuItem)`
  padding: 0 10px;

  & > button {
    display: flex;
    align-items: center;
    width: 100%;
    height: 32px;
    padding: 0 12px;
    border: none;
    border-radius: 6px;
    background: ${({ $selected }) => ($selected ? 'rgba(204, 54, 43, 0.4)' : 'transparent')};
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      background: ${({ $selected }) => ($selected ? 'rgba(204, 54, 43, 0.5)' : 'rgba(255, 255, 255, 0.08)')};
    }
  }
`;
