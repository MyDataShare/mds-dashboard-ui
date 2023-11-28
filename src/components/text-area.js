import PropTypes from 'prop-types';
import React from 'react';
import { get, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ErrorMessage from 'components/error-message';
import InputHelp from 'components/input-help';
import Label from 'components/label';
import { VALIDATE_NON_WHITESPACE } from 'util/validation';

const TextArea = ({
  id,
  name,
  label,
  help,
  required,
  placeholder,
  value,
  rows,
}) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const hasError = !!get(errors, name);
  return (
    <StyledInputContainer>
      <Label labelFor={id} isRequired={required}>
        {label}
      </Label>
      <StyledTextArea
        id={id}
        name={name}
        placeholder={t(placeholder)}
        defaultValue={value}
        required={required}
        $hasError={hasError}
        aria-invalid={hasError}
        rows={rows}
        {...register(name, {
          required,
          shouldUnregister: true,
          ...VALIDATE_NON_WHITESPACE,
        })}
      />
      <ErrorMessage fieldName={name} />
      {help && <InputHelp>{help}</InputHelp>}
    </StyledInputContainer>
  );
};

TextArea.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  help: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  rows: PropTypes.number,
};

TextArea.defaultProps = {
  required: false,
  rows: 2,
  placeholder: '',
  value: '',
  help: '',
};

export default TextArea;

/* Styled Components */

const StyledInputContainer = styled.div`
  padding: 0.625em 0 1.5em 0;
`;

const StyledTextArea = styled.textarea`
  font-family: inherit;
  font-size: inherit;
  overflow: auto;
  resize: none;
  outline: none;
  display: block;
  padding: 1em 0.5em;
  border: 0.063em solid
    ${(props) =>
      props.$hasError ? props.theme.errorColor : props.theme.grey800};
  width: 100%;

  ::placeholder {
    color: ${(props) => props.theme.grey700};
    font-style: italic;
  }
`;
