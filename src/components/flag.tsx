import styled from 'styled-components';

type Props = {
  alpha2: string;
  text: string;
};

const Flag = ({ alpha2, text }: Props) => (
  <StyledWrapper>
    <StyledFlag className={`fi fi-${alpha2}`} />
    {text}
  </StyledWrapper>
);

export default Flag;

/* Styled Components */

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledFlag = styled.span`
  margin-right: 0.5em;
  height: 0.75em;
`;
