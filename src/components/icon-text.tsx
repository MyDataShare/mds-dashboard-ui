import { ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  icon: ReactNode;
  text: ReactNode;
  className?: string;
  iconHeight?: string;
  iconWidth?: string;
}

const IconText = ({
  icon,
  text,
  className = undefined,
  iconHeight = undefined,
  iconWidth = undefined,
}: Props) => (
  <StyledWrapper className={className}>
    <StyledIconWrapper $height={iconHeight} $width={iconWidth}>
      {icon}
    </StyledIconWrapper>
    {text}
  </StyledWrapper>
);

export default IconText;

/* Styled Components */

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0.125em 0;
  width: fit-content;
`;

interface IconWrapperProps {
  $height?: string;
  $width?: string;
}

const StyledIconWrapper = styled.div<IconWrapperProps>`
  width: ${(props) => props.$width || '1em'};
  height: ${(props) => props.$height || '1em'};
  margin: 0 0.5em 0 0;
  svg {
    display: block;
    width: ${(props) => props.$width || '1em'};
    height: ${(props) => props.$height || '1em'};
  }
`;
