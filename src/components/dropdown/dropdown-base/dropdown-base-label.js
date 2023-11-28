import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const DropdownBaseLabel = ({ text }) => <StyledLabel>{text}</StyledLabel>;

DropdownBaseLabel.propTypes = {
  text: PropTypes.string.isRequired,
};

export default DropdownBaseLabel;

/* Styled Components */

const StyledLabel = styled.div`
  padding: 0.625em 1.25em;
  color: ${(props) => props.theme.grey600};
  font-weight: bold;
  text-transform: uppercase;
  font-size: ${(props) => props.theme.fontSizeSmaller};
  cursor: auto;
`;
