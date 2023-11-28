import { TFunction } from 'i18next';
import { HTMLProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
  labelFor?: string | undefined;
  isRequired?: boolean;
}

const Label = ({
  labelFor = undefined,
  isRequired = false,
  children,
  ...props
}: Props) => {
  const { t } = useTranslation();
  return (
    <StyledLabel $t={t} htmlFor={labelFor} $isRequired={isRequired} {...props}>
      {children}
    </StyledLabel>
  );
};

export default Label;

/* Styled Components */

interface LabelProps extends HTMLProps<HTMLLabelElement> {
  $isRequired: boolean;
  $t: TFunction;
}

const StyledLabel = styled.label<LabelProps>`
  font-weight: ${(props) => props.theme.fontSemiBold};
  display: block;
  margin: 0 0 0.25em 0;
  &&::after {
    content: ${(props) =>
      props.$isRequired ? '"\\00a0 *"' : `" (${props.$t('labelOptional')})"`};
    color: ${(props) =>
      props.$isRequired ? props.theme.errorColor : props.theme.grey700};
    font-weight: ${(props) =>
      props.$isRequired ? 'inherit' : props.theme.fontLight};'
  }
`;
