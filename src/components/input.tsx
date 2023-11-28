import { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react';
import { get, RegisterOptions, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ErrorMessage from 'components/error-message';
import InputHelp from 'components/input-help';
import Label from 'components/label';
import {
  VALIDATE_EMAIL,
  VALIDATE_NON_WHITESPACE,
  VALIDATE_URL,
} from 'util/validation';

interface Props {
  id: string;
  name: string;
  className?: string;
  disabled?: boolean;
  help?: string;
  hidden?: boolean;
  label?: string;
  options?: RegisterOptions;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  value?: string;
}

const Input = ({
  id,
  name,
  className = undefined,
  disabled = false,
  help = undefined,
  hidden = false,
  label = undefined,
  options = {},
  placeholder = undefined,
  readOnly = false,
  required = false,
  type = 'text',
  value = undefined,
}: Props) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const hasError = !!get(errors, name);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Some issue in React Hook Form. It thinks the 'pattern' option should be undefined.
  const opt: RegisterOptions = {
    required,
    shouldUnregister: true,
    ...VALIDATE_NON_WHITESPACE,
    ...getValidationsForType(type),
    ...options,
  };
  return (
    <StyledInputContainer hidden={hidden} className={className}>
      {label && (
        <Label labelFor={id} isRequired={required}>
          {label}
        </Label>
      )}

      <StyledInput
        id={name}
        placeholder={t(placeholder)}
        defaultValue={value}
        type={type}
        $hasError={hasError}
        aria-invalid={hasError}
        disabled={disabled}
        readOnly={readOnly}
        {...register(name, opt)}
      />
      <ErrorMessage fieldName={name} />
      {help && <InputHelp>{help}</InputHelp>}
    </StyledInputContainer>
  );
};

export default Input;

/* Helpers */

const getValidationsForType = (type: HTMLInputTypeAttribute) => {
  if (type === 'email') return VALIDATE_EMAIL;
  if (type === 'url') return VALIDATE_URL;
  return {};
};

/* Styled Components */

const StyledInputContainer = styled.div`
  padding: 0.625em 0 1.5em 0;
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  $hasError: boolean;
}

const StyledInput = styled.input.attrs((props) => ({
  type: props.type || 'text',
}))<InputProps>`
  font-size: inherit;
  display: block;
  padding: 1em 0.5em;
  border: 0.063em solid
    ${(props) =>
      props.$hasError ? props.theme.errorColor : props.theme.grey800};
  width: 100%;
  outline: none;

  ::placeholder {
    color: ${(props) => props.theme.grey700};
    font-style: italic;
  }
`;
