import PropTypes from 'prop-types';

export const propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export const compareProps = (p, n) => p.width === n.width && p.height === n.height;
