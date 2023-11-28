import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import ButtonArea from './button-area'; // TODO: Use react-aria for button states and focus
import AnnouncingLink from 'components/announcing-link';
import theme from 'theme';

// TODO: Use react-aria for button states and focus

const Button = ({
  text,
  icon,
  variant,
  colorVariant,
  size,
  to,
  buttonRef,
  textFirst,
  iconWidth,
  iconHeight,
  disabled,
  className,
  ...props
}) => {
  let ButtonComponent;
  let btnProps = { ...props, className };
  switch (variant) {
    case 'secondary':
      if (to) {
        if (disabled) {
          ButtonComponent = StyledSecondaryLinkButtonDisabled;
        } else {
          btnProps = { ...btnProps, to };
          ButtonComponent = StyledSecondaryLinkButton;
        }
      } else {
        btnProps = { ...btnProps, disabled };
        ButtonComponent = StyledSecondaryButton;
      }
      break;
    case 'text':
      if (to) {
        if (disabled) {
          ButtonComponent = StyledTextLinkButtonDisabled;
        } else {
          btnProps = { ...btnProps, to };
          ButtonComponent = StyledTextLinkButton;
        }
      } else {
        btnProps = { ...btnProps, disabled };
        ButtonComponent = StyledTextButton;
      }
      break;
    default:
      if (to) {
        if (disabled) {
          ButtonComponent = StyledPrimaryLinkButtonDisabled;
        } else {
          btnProps = { ...btnProps, to };
          ButtonComponent = StyledPrimaryLinkButton;
        }
      } else {
        btnProps = { ...btnProps, disabled };
        ButtonComponent = StyledPrimaryButton;
      }
      break;
  }
  let fontSize;
  switch (size) {
    case 'small':
      fontSize = '0.8em';
      break;
    case 'large':
      fontSize = '1.2em';
      break;
    default:
      fontSize = '1em';
      break;
  }
  const iconOnly = !!icon && text === null;
  return (
    <StyledWrapper
      ref={buttonRef}
      $colorVariant={colorVariant}
      className={className}
    >
      <ButtonComponent
        {...btnProps}
        fontSize={fontSize}
        $disabled={disabled}
        $colorVariant={colorVariant}
        $iconOnly={iconOnly}
      >
        {icon && (
          <StyledIconWrapper
            aria-hidden
            $iconOnly={iconOnly}
            $textFirst={textFirst}
            $width={iconWidth}
            $height={iconHeight}
          >
            {icon}
          </StyledIconWrapper>
        )}
        {text}
      </ButtonComponent>
    </StyledWrapper>
  );
};

Button.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'text']),
  colorVariant: PropTypes.oneOf(['normal', 'negative']),
  size: PropTypes.oneOf(['small', 'normal', 'large']),
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      search: PropTypes.string.isRequired,
    }),
  ]),
  buttonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  textFirst: PropTypes.bool,
  iconWidth: PropTypes.string,
  iconHeight: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

Button.defaultProps = {
  text: null,
  icon: null,
  variant: 'primary',
  colorVariant: 'normal',
  size: 'normal',
  to: null,
  buttonRef: null,
  textFirst: false,
  iconWidth: '1.25em',
  iconHeight: '1.25em',
  disabled: false,
  className: null,
};

Button.Area = ButtonArea;
export default Button;

/* Helpers */

const COLORS = {
  normal: {
    primaryColor: theme.green800,
    primaryHoverColor: theme.green900,
    primaryActiveColor: theme.green950,
    primaryDisabledColor: theme.grey700,
    primaryDisabledBackground: theme.grey300,

    secondaryHoverColor: theme.green50,
    secondaryActiveColor: theme.green100,
    secondaryDisabledColor: theme.grey600,

    textColor: theme.green800,
    textHoverColor: theme.green950,
    textDisabledColor: theme.grey600,
  },
  negative: {
    primaryColor: theme.errorColor,
    primaryHoverColor: theme.red900,
    primaryActiveColor: theme.red950,
    primaryDisabledColor: theme.grey700,
    primaryDisabledBackground: theme.grey300,

    secondaryHoverColor: theme.red50,
    secondaryActiveColor: theme.red100,
    secondaryDisabledColor: theme.errorColorLighter,

    textColor: theme.errorColor,
    textHoverColor: theme.red950,
    textDisabledColor: theme.errorColorLighter,
  },
};

/* Styled Components */

const StyledWrapper = styled.div`
  color: ${(props) => COLORS[props.$colorVariant].primaryColor};
  width: fit-content;
  @media only screen and (max-width: 500px) {
    width: 100%;
  }
`;

const buttonBaseStyle = (props) => `
  padding: 1em 1.5em;
  font-size: ${props.fontSize};
  font-weight: ${props.theme.fontSemiBold};
  display: inline-flex;
  gap: 0.75em;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: start;
  border: 0.063em solid ${COLORS[props.$colorVariant].primaryColor};
  transition: background-color 150ms ease-in, color 150ms ease-in;
  cursor: ${props.$disabled ? 'not-allowed' : 'auto'};
  &&:disabled {
    cursor: not-allowed;
  }
  @media only screen and (max-width: 500px) {
    width: ${props.$iconOnly ? 'auto' : '100%'};
  }
`;

const linkBaseStyle = () => `
  text-decoration: none;
`;

const primaryDisabledStyles = (props) => `
  background-color: ${COLORS[props.$colorVariant].primaryDisabledBackground};
  border-color: ${COLORS[props.$colorVariant].primaryDisabledBackground};
  color: ${COLORS[props.$colorVariant].primaryDisabledColor}
`;

const primaryStyle = (props) => `
  ${buttonBaseStyle(props)}
  min-width: 8em;
  background-color: ${COLORS[props.$colorVariant].primaryColor};
  color: #fff;
  &&:hover {
    background-color: ${COLORS[props.$colorVariant].primaryHoverColor};
    border-color: ${COLORS[props.$colorVariant].primaryHoverColor};
  }
  &&:active {
    background-color: ${COLORS[props.$colorVariant].primaryActiveColor};
    border-color: ${COLORS[props.$colorVariant].primaryActiveColor};
  }
  &&:disabled {
    ${primaryDisabledStyles(props)};
  }
  ${props.$disabled && primaryDisabledStyles(props)};
`;

const secondaryDisabledStyles = (props) => `
  border-color: ${COLORS[props.$colorVariant].secondaryDisabledColor};
  color: ${COLORS[props.$colorVariant].secondaryDisabledColor};
  &&:hover {
    background-color: transparent;
  }
`;

const secondaryStyle = (props) => `
  ${buttonBaseStyle(props)}
  min-width: 8em;
  color: ${COLORS[props.$colorVariant].primaryColor};
  background-color: #fff;
  &&:hover {
    background-color: ${COLORS[props.$colorVariant].secondaryHoverColor};
  }
  &&:active {
    background-color: ${COLORS[props.$colorVariant].secondaryActiveColor};
  }
  &&:disabled {
    ${secondaryDisabledStyles(props)};
  }
  ${props.$disabled && secondaryDisabledStyles(props)};
`;

const textDisabledStyles = (props) => `
  color: ${COLORS[props.$colorVariant].textDisabledColor};
  &&:hover {
    color: ${COLORS[props.$colorVariant].textDisabledColor};
  }
`;

const textStyle = (props) => `
  ${buttonBaseStyle(props)}
  background-color: transparent;
  border: none;
  padding: 0;
  color: ${COLORS[props.$colorVariant].textColor};
  &&:hover {
    color: ${COLORS[props.$colorVariant].textHoverColor};
  }
  &&:disabled {
    ${textDisabledStyles(props)};
  }
  ${props.$disabled && textDisabledStyles(props)};
`;

const StyledPrimaryButton = styled.button`
  ${(props) => primaryStyle(props)}
`;

const StyledPrimaryLinkButton = styled(AnnouncingLink)`
  ${(props) => primaryStyle(props)}
  ${(props) => linkBaseStyle(props)}
  color: #ffffff !important;
`;

const StyledPrimaryLinkButtonDisabled = styled.div`
  ${(props) => primaryStyle(props)}
  ${(props) => linkBaseStyle(props)}
`;

const StyledSecondaryButton = styled.button`
  ${(props) => secondaryStyle(props)}
`;

const StyledSecondaryLinkButton = styled(AnnouncingLink)`
  ${(props) => secondaryStyle(props)}
  ${(props) => linkBaseStyle(props)}
`;

const StyledSecondaryLinkButtonDisabled = styled.div`
  ${(props) => secondaryStyle(props)}
  ${(props) => linkBaseStyle(props)}
`;

const StyledTextButton = styled.button`
  ${(props) => textStyle(props)}
`;

const StyledTextLinkButton = styled(AnnouncingLink)`
  ${(props) => textStyle(props)}
  ${(props) => linkBaseStyle(props)}
`;

const StyledTextLinkButtonDisabled = styled.div`
  ${(props) => textStyle(props)}
  ${(props) => linkBaseStyle(props)}
`;

const StyledIconWrapper = styled.div`
  width: ${(p) => p.$width};
  height: ${(p) => p.$height};
  margin: ${(props) => (props.$iconOnly ? '0.75em' : '0')};
  display: flex;
  align-items: center;
  order: ${(props) => (props.$textFirst ? '2' : '0')};
  svg {
    width: ${(p) => p.$width};
    height: ${(p) => p.$height};
  }
`;
