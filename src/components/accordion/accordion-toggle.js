import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const AccordionToggle = ({ collapsed }) => (
  <StyledCollapseButton>
    <FontAwesomeIcon
      icon={icon({ name: 'chevron-down' })}
      font-size="1.125em"
      style={{
        transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
      }}
    />
  </StyledCollapseButton>
);

AccordionToggle.propTypes = {
  collapsed: PropTypes.bool,
};

AccordionToggle.defaultProps = {
  collapsed: true,
};

export default AccordionToggle;

/* Styled Components */

const StyledCollapseButton = styled.button`
  display: flex;
  align-items: center;
  text-transform: none;
  border-style: none;
  background: transparent;
  height: 100%;
  cursor: pointer;
`;
