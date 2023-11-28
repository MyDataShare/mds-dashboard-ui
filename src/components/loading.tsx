import styled from 'styled-components';

import { Theme } from 'theme';

const Loading = () => (
  <StyledContainer>
    <StyledFlashingDot id="loading-indicator" />
  </StyledContainer>
);

export default Loading;

const commonStyles = (theme: Theme) => `
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${theme.vgGreen};
  color: ${theme.vgGreen};
`;

const StyledFlashingDot = styled.div`
  position: relative;
  animation: dotFlashing 1s infinite linear alternate;
  animation-delay: 0.5s;
  ${(props) => commonStyles(props.theme)};

  &&::before,
  &&::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
    ${(props) => commonStyles(props.theme)};
  }

  &&::before {
    left: -15px;
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 0s;
  }

  &&::after {
    left: 15px;
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 1s;
  }

  @keyframes dotFlashing {
    0% {
      background-color: ${(props) => props.theme.vgGreen};
    }
    50%,
    100% {
      background-color: ${(props) => props.theme.green200};
    }
  }
`;

const StyledContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 0 auto;
`;
