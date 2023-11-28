import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

const SpinnerIcon = () => (
  <StyledSpinnerWrapper>
    <FontAwesomeIcon icon={icon({ name: 'spinner' })} />
  </StyledSpinnerWrapper>
);

export default SpinnerIcon;

/* Styled Components */

const StyledSpinnerWrapper = styled.div`
  line-height: 0;
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  animation-name: spin;
  animation-duration: 2000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
`;
