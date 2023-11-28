import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const DropdownBaseItem = ({
  text,
  value,
  onClick,
  indent,
  onSelect,
  ...props
}) => (
  <StyledItemButton
    $indent={indent}
    type="button"
    {...props}
    onClick={(e) => {
      e.stopPropagation();
      if (onSelect) onSelect(value || text);
      if (onClick) onClick();
    }}
  >
    {text}
  </StyledItemButton>
);

DropdownBaseItem.propTypes = {
  text: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClick: PropTypes.func,
  onSelect: PropTypes.func,
  indent: PropTypes.bool,
};

DropdownBaseItem.defaultProps = {
  value: null,
  onClick: null,
  onSelect: null,
  indent: false,
};

export { itemStyles };
export default DropdownBaseItem;

/* Styled Components */

const itemStyles = (props) => `
  background-color: #fff;
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5em 1em 0.5em ${props.$indent ? '1.75em' : '1em'};
  &&:hover {
    background-color: ${props.theme.grey200};
  }
`;

const StyledItemButton = styled.button`
  ${(props) => itemStyles(props)}
`;
