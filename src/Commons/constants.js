export const buildIconProps = (isFullscreen = false) => {
  if (isFullscreen) {
    return {
      width: 54,
      height: 54,
    };
  }

  return {
    width: 36,
    height: 36,
  };
};
