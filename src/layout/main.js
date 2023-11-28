import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Main = ({ children }) => <StyledMain>{children}</StyledMain>;

Main.propTypes = {
  children: PropTypes.node,
};

Main.defaultProps = {
  children: null,
};

export default Main;

/* Styled Components */

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  max-width: 80em;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5em;
  @media only screen and (max-width: 500px) {
    padding: 0 1em;
  }
`;
