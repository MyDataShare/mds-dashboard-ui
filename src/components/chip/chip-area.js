import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const ChipArea = ({ children }) => <Wrapper>{children}</Wrapper>;

ChipArea.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ChipArea;

/* Styled Components */

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75em;
  max-width: 60em;
  margin: 0.75em 0;
`;
