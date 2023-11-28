import PropTypes from 'prop-types';
import { ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
}

const InlineHeadingWrapper = ({ children }: Props) => (
  <StyledInlineHeadingWrapper>{children}</StyledInlineHeadingWrapper>
);

InlineHeadingWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default InlineHeadingWrapper;

/* Styled Components */

const StyledInlineHeadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: -0.5em 0;
  > * {
    margin: 0.5em 0;
  }
`;
