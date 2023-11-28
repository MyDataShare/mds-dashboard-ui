/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import ChipArea from './chip-area';

const Chip = ({ selectable, selected, onClick, children }) => (
  <StyledChip onClick={onClick} $selectable={selectable} $selected={selected}>
    {children}
  </StyledChip>
);

Chip.propTypes = {
  selectable: PropTypes.bool,
  selected: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

Chip.defaultProps = {
  selectable: false,
  selected: false,
  onClick: null,
};

Chip.Area = ChipArea;
export default Chip;

/* Styled Components */

const StyledChip = styled.div`
  display: inline-flex;
  align-items: center;
  border-radius: 1.5em;
  background-color: ${(p) => (p.$selectable ? '#ffffff' : p.theme.vgTan)};
  border: ${(p) =>
    p.$selectable
      ? p.$selected
        ? `2px solid ${p.theme.vgGreen}`
        : `1px solid ${p.theme.grey250}`
      : 'none'};
  margin: ${(p) => (p.$selected ? '0' : '1px')};
  padding: 0.375em 1em;
  white-space: nowrap;
  svg {
    width: 1em;
    height: 1em;
    margin-right: 0.5em;
  }
  &&:hover {
    cursor: ${(p) => (p.$selectable ? 'pointer' : 'auto')};
  }
  transition: border-color 150ms ease-in-out;
`;
