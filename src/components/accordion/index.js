import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';

import AccordionToggle from './accordion-toggle';

const Accordion = ({
  collapsed,
  titleComponent,
  children,
  disabled,
  showToggle,
  toggleFirst,
  className,
}) => {
  const [rawCollapsed, setRawCollapsed] = useState(collapsed);
  const toggleCollapsed = () => setRawCollapsed(!rawCollapsed);
  return (
    <StyledAccordion className={className}>
      <StyledTitleWrapper
        onClick={() => !disabled && toggleCollapsed()}
        $disabled={disabled}
      >
        {!disabled && showToggle && toggleFirst && (
          <Accordion.Toggle collapsed={rawCollapsed} />
        )}
        {titleComponent}
        {!disabled && showToggle && !toggleFirst && (
          <Accordion.Toggle collapsed={rawCollapsed} />
        )}
      </StyledTitleWrapper>
      <StyledCollapsibleWrapper $collapsed={rawCollapsed}>
        {children}
      </StyledCollapsibleWrapper>
    </StyledAccordion>
  );
};

Accordion.propTypes = {
  titleComponent: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  collapsed: PropTypes.bool,
  disabled: PropTypes.bool,
  showToggle: PropTypes.bool,
  toggleFirst: PropTypes.bool,
  className: PropTypes.string,
};

Accordion.defaultProps = {
  collapsed: true,
  disabled: false,
  showToggle: false,
  toggleFirst: false,
  className: null,
};

Accordion.Toggle = AccordionToggle;
export default Accordion;

/* Styled Components */

const StyledAccordion = styled.div`
  width: 100%;
`;

const StyledTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  gap: 0.75em;
  cursor: ${(p) => (p.$disabled ? 'auto' : 'pointer')};
`;

const StyledCollapsibleWrapper = styled.div`
  height: ${(props) => (props.$collapsed ? '0' : 'auto')};
  overflow: hidden;
  padding-bottom: 0;
`;
