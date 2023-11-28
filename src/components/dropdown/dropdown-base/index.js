import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import DropdownBaseItem from './dropdown-base-item';
import DropdownBaseLabel from './dropdown-base-label';
import { useOutsideClick, useWindowDimensions } from 'hooks';

// TODO: Use react-portal?
const DropdownBase = ({
  id,
  children,
  dropdownItems,
  selectedItem,
  showBorder,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [_selectedItem, _setSelectedItem] = React.useState(selectedItem);
  const labelRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  useOutsideClick(
    dropdownRef,
    (event) => setIsOpen(event.target === labelRef.current),
    isOpen
  );
  const { width } = useWindowDimensions();
  const openDropdownOnRight = !!(
    labelRef &&
    labelRef.current &&
    labelRef.current.getBoundingClientRect().right < width / 2
  );
  const dropdownId = `dropdown-${id}`;
  const toggleIsOpen = () => setIsOpen(!isOpen);
  return (
    <StyledWrapper className="dropdownBase" $showBorder={showBorder}>
      {children({
        isOpen,
        toggleIsOpen,
        dropdownId,
        labelRef,
        selectedItem: _selectedItem,
      })}
      <StyledDropdown
        id={dropdownId}
        ref={dropdownRef}
        $isOpen={isOpen}
        $floatRight={openDropdownOnRight}
        onClick={(e) => e.stopPropagation()}
      >
        {dropdownItems &&
          React.Children.map(dropdownItems, (child) =>
            child
              ? React.cloneElement(child, {
                  onClick: (event) => {
                    setIsOpen(false);
                    if (child.props.onClick) child.props.onClick(event);
                  },
                  onSelect: (value) => _setSelectedItem(value),
                })
              : null
          )}
      </StyledDropdown>
    </StyledWrapper>
  );
};

DropdownBase.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
  dropdownItems: PropTypes.node.isRequired,
  selectedItem: PropTypes.string,
  showBorder: PropTypes.bool,
};

DropdownBase.defaultProps = {
  selectedItem: null,
  showBorder: false,
};

DropdownBase.Item = DropdownBaseItem;
DropdownBase.Label = DropdownBaseLabel;
export default DropdownBase;

/* Styled Components */

const StyledWrapper = styled.div`
  position: relative;
  width: fit-content;
  border: ${(p) =>
    p.$showBorder ? `1px solid ${p.theme.grey800}` : '0px solid black'};
`;

const StyledDropdown = styled.div`
  z-index: 10;
  background-color: #ffffff;
  border: 0.063em solid ${(props) => props.theme.grey300};
  display: block;
  visibility: ${(props) => (props.$isOpen ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.$isOpen ? '1' : '0')};
  transition:
    visibility 150ms ease-in-out,
    opacity 150ms ease-in-out;
  right: ${(props) => (props.$floatRight ? 'auto' : '0')};
  left: ${(props) => (props.$floatRight ? '0' : 'auto')};
  margin-top: 0.5em;
  padding: 0.5em 0;
  position: absolute;
  min-width: 16em;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.04);
  hr {
    margin: 0.5em 0;
  }
`;
