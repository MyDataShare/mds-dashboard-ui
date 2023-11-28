// Aliased on account of namespace clash
import { icon as FAIcon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import DropdownBase from './dropdown-base';
import Button from 'components/button';

const Dropdown = ({
  icon,
  text,
  id,
  useTextButton,
  children,
  showBorder,
  normalWeightValue,
}) => (
  <StyledWrapper>
    <DropdownBase id={id} dropdownItems={children} showBorder={showBorder}>
      {({ isOpen, toggleIsOpen, dropdownId, labelRef }) =>
        useTextButton ? (
          <Button
            buttonRef={labelRef}
            text={text}
            icon={icon}
            onClick={(e) => {
              e.stopPropagation();
              return toggleIsOpen();
            }}
            type="button"
            variant="text"
            id={id}
            aria-expanded={isOpen}
            aria-controls={dropdownId}
          />
        ) : (
          <StyledLabelWrapper
            ref={labelRef}
            onClick={toggleIsOpen}
            $isOpen={isOpen}
            aria-expanded={isOpen}
            id={id}
            aria-controls={dropdownId}
            type="button"
            $normalWeightLabel={normalWeightValue}
          >
            <StyledLabel>
              {icon && <StyledIconWrapper>{icon}</StyledIconWrapper>}
              {text && (
                <>
                  <span>{text}</span>
                  <FontAwesomeIcon
                    icon={FAIcon({ name: 'chevron-down' })}
                    font-size="0.75em"
                  />
                </>
              )}
            </StyledLabel>
          </StyledLabelWrapper>
        )
      }
    </DropdownBase>
  </StyledWrapper>
);

Dropdown.propTypes = {
  text: PropTypes.string,
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.node,
  useTextButton: PropTypes.bool,
  showBorder: PropTypes.bool,
  normalWeightValue: PropTypes.bool,
};

Dropdown.defaultProps = {
  text: null,
  icon: null,
  useTextButton: false,
  showBorder: false,
  normalWeightValue: false,
};

Dropdown.Item = DropdownBase.Item;
Dropdown.Label = DropdownBase.Label;
export default Dropdown;

/* Styled Components */

const StyledWrapper = styled.div`
  width: fit-content;
`;

const StyledLabelWrapper = styled.button`
  background-color: ${(props) =>
    props.$isOpen ? props.theme.grey200 : 'inherit'};
  transition: background-color 150ms ease-in;
  padding: 0.5em 1.2em;
  font-weight: ${(props) =>
    props.$normalWeightLabel
      ? props.theme.fontRegular
      : props.theme.fontMedium};
  &&:hover {
    background-color: ${(props) => props.theme.grey200};
  }
  &&:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
`;

const StyledLabel = styled.div`
  display: flex;
  align-items: center;
  span {
    margin-right: 0.5em;
  }
`;

const StyledIconWrapper = styled.div`
  width: 1.25em;
  height: 1.25em;
  display: flex;
  align-items: center;
  margin-right: 0.5em;
  svg {
    width: 1.25em;
    height: 1.25em;
  }
`;
