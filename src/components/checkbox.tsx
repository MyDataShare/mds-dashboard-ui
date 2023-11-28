import { InputHTMLAttributes, ReactNode } from 'react';
import { useFocusRing } from 'react-aria';
import { get, RegisterOptions, useFormContext } from 'react-hook-form';
import styled from 'styled-components';

// svg-icon used, since masking with FontAwesomeIcons would require non-trivial renovations.
import checkIcon from 'assets/check-regular.svg';
import ErrorMessage from 'components/error-message';

// TODO: Use react-aria useCheckbox

interface FormCheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  options?: RegisterOptions;
  value?: string;
}

const FormCheckbox = ({
  id,
  name,
  checked,
  children = undefined,
  className = undefined,
  disabled = false,
  onClick = undefined,
  options = {},
  value = undefined,
}: FormCheckboxProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { isFocusVisible, focusProps } = useFocusRing();
  const hasError = !!get(errors, name);
  const inputProps: InputHTMLAttributes<HTMLInputElement> = {
    defaultChecked: checked,
    id,
    disabled,
    onClick,
    'aria-invalid': hasError,
    ...register(name, options),
  };
  if (value) {
    inputProps.value = value;
  }
  return (
    <>
      <StyledLabel
        disabled={disabled}
        $isFocusVisible={isFocusVisible}
        className={className}
      >
        <StyledInput {...inputProps} {...focusProps} type="checkbox" />
        <StyledText $hasError={hasError} disabled={disabled}>
          {children}
        </StyledText>
      </StyledLabel>
      <StyledErrorMessage fieldName={name} />
    </>
  );
};

interface Props extends FormCheckboxProps {
  withoutForm?: boolean;
}

const Checkbox = ({
  withoutForm = false,
  disabled = false,
  ...props
}: Props) => {
  const { isFocusVisible, focusProps } = useFocusRing();
  const { checked, children, className, id, onClick } = props;
  if (!withoutForm) {
    return <FormCheckbox {...props}>{children}</FormCheckbox>;
  }
  return (
    <StyledLabel
      disabled={disabled}
      $isFocusVisible={isFocusVisible}
      className={className}
    >
      <StyledInput
        id={id}
        type="checkbox"
        checked={checked}
        {...focusProps}
        onClick={onClick}
      />
      <StyledText disabled={disabled} $hasError={false}>
        {children}
      </StyledText>
    </StyledLabel>
  );
};

export default Checkbox;

/* Styled Components */

const StyledInput = styled.input<InputHTMLAttributes<HTMLInputElement>>`
  clip-path: polygon(0 0);
`;

interface TextProps {
  $hasError: boolean;
  disabled: boolean;
}

const StyledText = styled.span<TextProps>`
  margin-top: 0.063em;
  display: inline-block;
  padding-left: 1.875em;
  &&::before,
  &&::after {
    transition: all 150ms ease-in;
  }

  &&::before {
    content: '';
    display: block;
    width: 1.75em;
    height: 1.75em;
    border: 0.063em solid
      ${(props) =>
        props.$hasError ? props.theme.errorColor : props.theme.grey800};
    border-radius: 0.125em;
    background: transparent;
    position: absolute;
    top: 0.25em;
    left: 0.25em;
    opacity: ${(props) => (props.disabled ? '0.6' : '1')};
  }

  &&::after {
    content: '';
    display: block;
    width: 1.25em;
    height: 1.25em;
    mask: url(${checkIcon}) no-repeat 50% 50%; // Mask allows changing svg color

    // Styled Components v6 no longer adds vendor prefixes by default...
    -webkit-mask: url(${checkIcon}) no-repeat 50% 50%;

    background-color: #fff; // Sets the svg color
    position: absolute;
    top: 0.5em;
    left: 0.5em;
    transform: scale(0);
  }
`;

interface LabelProps {
  $isFocusVisible: boolean;
  disabled: boolean;
}

const StyledLabel = styled.label<LabelProps>`
  cursor: ${(props) => (props.disabled ? 'auto' : 'pointer')};
  position: relative;
  display: flex;
  width: fit-content;
  margin: 1.75em 0;
  padding: 0.25em;
  outline: ${(p) => (p.$isFocusVisible ? '2px auto Highlight' : 'none')};
  outline: ${(p) =>
    p.$isFocusVisible ? '2px auto -webkit-focus-ring-color' : 'none'};
  > ${StyledInput}:checked + ${StyledText}::before {
    background: ${(props) => props.theme.vgGreen};
  }

  > ${StyledInput}:checked + ${StyledText}::after {
    transform: scale(1);
  }
  + p {
    margin-top: 4em;
  }
`;

const StyledErrorMessage = styled(ErrorMessage)`
  margin: -1.75em 0 0 0.25em;
`;
