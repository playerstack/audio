import React from 'react';

// Convert kebab-case SVG attribute names to camelCase for React DOM
function toReactAttrs(attrs) {
  const result = {};
  for (const key in attrs) {
    const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = attrs[key];
  }
  return result;
}

function renderElement(el, index) {
  const { tag, attrs, children } = el;
  const Tag = tag;
  return (
    <Tag key={index} {...toReactAttrs(attrs)}>
      {children?.map(renderElement)}
    </Tag>
  );
}

const Icon = React.memo(({ icon, width = 36, height = 36, className, ...rest }) => (
  <svg
    viewBox={icon.viewBox}
    width={width}
    height={height}
    fill={icon.fill || 'currentColor'}
    className={className}
    {...rest}
  >
    {icon.elements.map(renderElement)}
  </svg>
));

Icon.displayName = 'Icon';

export default Icon;
