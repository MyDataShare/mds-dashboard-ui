import PropTypes from 'prop-types';
import React from 'react';
import { get, useFormContext } from 'react-hook-form';
import styled from 'styled-components';

import SelectOption from './select-option';
import dropdownIcon from 'assets/chevron-down-solid.svg';
import ErrorMessage from 'components/error-message';
import InputHelp from 'components/input-help';
import Label from 'components/label';

const Select = ({
  id,
  name,
  label,
  children,
  help,
  required,
  disabled,
  hidden,
  defaultValue,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const hasError = !!get(errors, name);
  return (
    <StyledInputContainer hidden={hidden}>
      <Label labelFor={id} isRequired={required}>
        {label}
      </Label>
      <StyledSelectWrapper>
        <StyledSelect
          className="labelRef"
          required={required}
          id={id}
          defaultValue={defaultValue}
          disabled={disabled}
          $hasError={hasError}
          aria-invalid={hasError}
          {...register(name, { required, shouldUnregister: true })}
        >
          {children}
        </StyledSelect>
      </StyledSelectWrapper>
      <ErrorMessage fieldName={name} />
      {help && <InputHelp>{help}</InputHelp>}
    </StyledInputContainer>
  );
};

Select.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  help: PropTypes.string,
  required: PropTypes.bool,
  hidden: PropTypes.bool,
  disabled: PropTypes.bool,
  defaultValue: PropTypes.string,
};

Select.defaultProps = {
  required: false,
  help: '',
  hidden: false,
  disabled: false,
  defaultValue: null,
};

Select.Option = SelectOption;
export default Select;

/* Styled Components */

const StyledInputContainer = styled.div`
  padding: 0.625em 0 1.5em 0;
  width: fit-content;
`;

const StyledSelectWrapper = styled.div`
  position: relative;
  line-height: 0;
  &&::after {
    pointer-events: none;
    position: absolute;
    content: url(${dropdownIcon});
    height: 0.75em;
    width: 0.75em;
    top: 50%;
    right: 1.5em;
    transform: translateY(-50%);
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  appearance: none;
  border-radius: 0;
  padding: 0.5em 3em 0.5em 1em;
  border: 0.063em solid
    ${(props) =>
      props.$hasError ? props.theme.errorColor : props.theme.grey800};
  transition: background-color 150ms ease-in;
  white-space: normal;
  &&:hover:not(:disabled) {
    background-color: ${(props) => props.theme.grey200};
    cursor: pointer;
  }
`;
