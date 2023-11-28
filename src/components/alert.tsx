import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import styled from 'styled-components';

type AlertVariant = 'plain' | 'info' | 'warning';

interface AlertColors {
  bg: string;
  border: string;
  icon: string;
}

const COLORS: Record<AlertVariant, AlertColors> = {
  plain: {
    bg: '#e5deff50',
    border: '#e5deff',
    icon: '#a891ff',
  },
  info: {
    bg: '#e5deff50',
    border: '#e5deff',
    icon: '#a891ff',
  },
  warning: {
    bg: '#fffbe3',
    border: '#ffec7b',
    icon: '#f8d737',
  },
};

interface Props {
  children?: ReactNode;
  className?: string;
  heading?: string;
  id?: string;
  variant?: AlertVariant;
}

const Alert = ({
  children = null,
  className = undefined,
  heading = undefined,
  id = undefined,
  variant = 'plain',
}: Props) => {
  let IconComponent;
  let colors;
  switch (variant) {
    case 'info':
      IconComponent = <FontAwesomeIcon icon={icon({ name: 'circle-info' })} />;
      colors = COLORS.info;
      break;
    case 'warning':
      IconComponent = (
        <FontAwesomeIcon icon={icon({ name: 'triangle-exclamation' })} />
      );
      colors = COLORS.warning;
      break;
    case 'plain':
    default:
      IconComponent = null;
      colors = COLORS.info;
  }
  return (
    <StyledCard id={id} $colors={colors} className={className}>
      {IconComponent && <StyledIconWrapper>{IconComponent}</StyledIconWrapper>}
      <div>
        {heading && <StyledHeading>{heading}</StyledHeading>}
        {children}
      </div>
    </StyledCard>
  );
};

export default Alert;

/* Styled Components */

interface CardProps {
  $colors: AlertColors;
}

const StyledCard = styled.div<CardProps>`
  max-width: 72ch;
  display: flex;
  align-items: center;
  padding: 1em;
  background-color: ${(props) => props.$colors.bg};
  border: 0.063em solid ${(props) => props.$colors.border};
  width: fit-content;
  svg:not(button svg) {
    height: 1.5em;
    width: 1.5em;
    color: ${(props) => props.$colors.icon};
  }
  *:last-child {
    margin-bottom: 0;
  }
  p {
    margin-top: 0.5em;
  }
  p:first-child {
    margin-top: 0;
  }
`;

const StyledIconWrapper = styled.div`
  height: 1.5em;
  width: 1.5em;
  margin-right: 1em;
`;

const StyledHeading = styled.h4`
  margin-top: 0.175em;
  margin-bottom: 0;
`;
