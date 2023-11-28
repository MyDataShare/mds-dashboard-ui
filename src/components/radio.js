import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import {
  useFocusRing,
  useRadio,
  useRadioGroup,
  VisuallyHidden,
} from 'react-aria';
import { Controller, useFormContext } from 'react-hook-form';
import { useRadioGroupState } from 'react-stately';
import styled, { useTheme } from 'styled-components';

import ErrorMessage from 'components/error-message';
import InputHelp from 'components/input-help';
import Label from 'components/label';

const RadioContext = createContext(null);

const RadioGroup = ({ className, ...props }) => {
  const { children, label, help, required, name } = props;
  const state = useRadioGroupState(props);
  const { radioGroupProps, labelProps, descriptionProps } = useRadioGroup(
    props,
    state
  );
  return (
    <StyledRadioGroupWrapper {...radioGroupProps} className={className}>
      <Label {...labelProps} isRequired={required}>
        {label}
      </Label>
      <RadioContext.Provider value={state}>{children}</RadioContext.Provider>
      {help && <InputHelp {...descriptionProps}>{help}</InputHelp>}
      <ErrorMessage fieldName={name} />
    </StyledRadioGroupWrapper>
  );
};

RadioGroup.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  help: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  required: PropTypes.bool,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
};

RadioGroup.defaultProps = {
  help: null,
  className: null,
  children: null,
  required: false,
  defaultValue: null,
  value: undefined,
};

const Radio = (props) => {
  const { children, help, disabled } = props;
  const state = useContext(RadioContext);
  const { vgGreen: activeColor } = useTheme();
  const { control, setValue } = useFormContext();
  const { name } = state;
  const ref = useRef(null);
  const { inputProps, isSelected, isDisabled } = useRadio(
    { ...props, isDisabled: disabled },
    state,
    ref
  );
  const { isFocusVisible, focusProps } = useFocusRing();
  const strokeWidth = isSelected ? 6 : 2;

  useEffect(() => {
    // This fixes issue where defaultValue gets overridden with undefined when mounting a Radio
    if (inputProps.checked) {
      setValue(name, inputProps.value);
    }
  }, [inputProps.checked, inputProps.value, name, setValue]);

  // Handles updating state in React Aria and form values in React Hook Form
  const onChangeValue = (e) => {
    inputProps.onChange(e);
    setValue(name, e.target.value);
  };

  const inputId = `${name}-${inputProps.value}`;
  return (
    <>
      <StyledLabel htmlFor={inputId} $isDisabled={isDisabled}>
        <VisuallyHidden>
          <Controller
            name={name}
            control={control}
            render={() => (
              <input
                id={inputId}
                ref={ref}
                {...inputProps}
                {...focusProps}
                onChange={onChangeValue}
              />
            )}
          />
        </VisuallyHidden>
        <svg
          width={24}
          height={24}
          aria-hidden="true"
          style={{ marginRight: 4 }}
        >
          <circle
            cx={12}
            cy={12}
            r={8 - strokeWidth / 2}
            fill="none"
            stroke={inputProps.checked ? activeColor : 'gray'}
            strokeWidth={strokeWidth}
          />
          {isFocusVisible && (
            <circle
              cx={12}
              cy={12}
              r={11}
              fill="none"
              stroke={activeColor}
              strokeWidth={2}
            />
          )}
        </svg>
        {children}
      </StyledLabel>
      {help && <StyledRadioHelp>{help}</StyledRadioHelp>}
    </>
  );
};

Radio.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  help: PropTypes.string,
  disabled: PropTypes.bool,
};

Radio.defaultProps = {
  help: null,
  disabled: false,
};

Radio.Group = RadioGroup;
export default Radio;

/* Styled Components */

const StyledLabel = styled.label`
  display: flex;
  align-items: center;
  opacity: ${(props) => (props.$isDisabled ? 0.4 : 1)};
`;

const StyledRadioGroupWrapper = styled.div`
  margin: 0.625em 0 1.5em 0;
`;

const StyledRadioHelp = styled(InputHelp)`
  margin: -1.25em 0 0 1.52em;
`;
