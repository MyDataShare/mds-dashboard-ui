import { get, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props {
  fieldName: string;
  className?: string;
}

const ErrorMessage = ({ fieldName, className = undefined }: Props) => {
  const { t } = useTranslation();
  const {
    formState: { errors },
  } = useFormContext();
  if (!errors || !get(errors, fieldName)) return null;
  const error = get(errors, fieldName);
  const message = error.message.length
    ? t(error.message)
    : t('errorValidationRequired');
  return (
    <Message className={className} role="alert">
      {message}
    </Message>
  );
};

export default ErrorMessage;

/* Styled Components */

const Message = styled.span`
  display: block;
  margin-top: 0.313em;
  color: ${(props) => props.theme.errorColor};
  font-size: 0.875em;
`;
