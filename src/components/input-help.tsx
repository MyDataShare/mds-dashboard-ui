import { ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
}

const InputHelp = ({ children, ...props }: Props) => (
  <StyledHelp {...props}>{children}</StyledHelp>
);

export default InputHelp;

/* Styled Components */

const StyledHelp = styled.div`
  max-width: 70ch;
  color: ${(props) => props.theme.grey700};
  // 0.64em matches the inner padding of text inside the input
  // 0.2858em here matches the label bottom margin (0.25em)
  // font-size 0.875em is 14px (if root is 16px)
  padding: 0 0 0 0.5em;
  margin: 0.2858em 0.64em 0 0.64em;
  font-size: 0.875em;
`;
