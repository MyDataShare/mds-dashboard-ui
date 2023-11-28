import PropTypes from 'prop-types';
import React from 'react';
import DatePicker from 'react-datepicker';
import { Controller, get, useFormContext } from 'react-hook-form';
import styled from 'styled-components';

import ErrorMessage from 'components/error-message';
import Label from 'components/label';
import { getDateFnsLocale, toUTC } from 'util/date';

const DateTime = ({ id, name, label, required, hidden, options }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const hasError = !!get(errors, name);
  let opt = {
    shouldUnregister: true,
  };
  if (options) {
    opt = { ...opt, ...options };
  }
  // TODO: The DatePicker date format doesn't match displayed values using formatDate()...
  return (
    <StyledInputContainer hidden={hidden} hasError={hasError}>
      {label && (
        <Label labelFor={id} isRequired={required}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{ required }}
        render={({ field: { onChange, value } }) => (
          <DatePicker
            id={id}
            selected={value ? toUTC(value, true) : null}
            onChange={(date) => onChange(toUTC(date))}
            aria-invalid={hasError}
            required={required}
            locale={getDateFnsLocale()}
            dateFormat="yyyy/MM/dd"
            {...opt}
          />
        )}
      />
      <ErrorMessage fieldName={name} />
    </StyledInputContainer>
  );
};

DateTime.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  hidden: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  options: PropTypes.object,
};

DateTime.defaultProps = {
  label: '',
  required: false,
  hidden: false,
  options: null,
};

export default DateTime;

/* Styled Components */

const StyledInputContainer = styled.div`
  padding: 0.625em 0 1em 0;
  input {
    width: 100%;
    font-size: inherit;
    padding: 1em 0.5em;
    outline: none;
    border: 0.063em solid
      ${(props) =>
        props.hasError ? props.theme.errorColor : props.theme.grey800};
  }
`;
