import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const ButtonArea = ({ vertical, justify, children, className }) => (
  <StyledArea className={className} $vertical={vertical} $justify={justify}>
    {children}
  </StyledArea>
);

ButtonArea.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  vertical: PropTypes.bool,
  justify: PropTypes.oneOf(['start', 'center', 'space-between', 'end']),
};

ButtonArea.defaultProps = {
  className: 'buttonArea',
  vertical: false,
  justify: 'end',
};

export default ButtonArea;

/* Helpers */

const getFlexJustify = (justify) => {
  if (justify === 'start' || justify === 'end') return `flex-${justify}`;
  return justify;
};

/* Styled Components */

// TODO: Horizontal ButtonArea should wrap on mobile!

const StyledArea = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.$vertical ? 'column' : 'row')};
  flex-wrap: wrap;
  margin: 2em -0.5em;
  justify-content: ${(props) => getFlexJustify(props.$justify)};
  > div {
    margin: 0.5em;
  }
  @media only screen and (max-width: 500px) {
    margin: 2em -0.25em;
    > div {
      margin: 0.25em;
    }
  }
`;
