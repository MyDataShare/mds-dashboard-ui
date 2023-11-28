import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import {
  FocusRing,
  FocusScope,
  mergeProps,
  OverlayContainer,
  useDialog,
  useModal,
  useOverlay,
  usePreventScroll,
  VisuallyHidden,
} from 'react-aria';
import styled from 'styled-components';

const Modal = ({
  children,
  showCloseButton,
  title,
  onClose,
  isDismissable,
  ...rest
}) => {
  const ref = useRef(null);
  const { modalProps } = useModal();
  const { dialogProps, titleProps } = useDialog({}, ref);
  const { overlayProps } = useOverlay(
    { onClose, isOpen: true, isDismissable },
    ref
  );

  const wrapperProps = mergeProps(dialogProps, modalProps, overlayProps, rest);

  usePreventScroll();

  return (
    <OverlayContainer>
      <StyledBackdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <FocusScope contain restoreFocus autoFocus>
          <StyledWrapper
            {...wrapperProps}
            initial={{ opacity: 0, scale: 0, y: 100 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotate: 0,
            }}
            exit={{ opacity: 0, scale: 0, rotate: -15 }}
            ref={ref}
          >
            {title && (
              <VisuallyHidden>
                <h3 {...titleProps}>{title}</h3>
              </VisuallyHidden>
            )}
            <StyledContent>
              {showCloseButton && (
                <FocusRing focusRingClass="modal-close-button-focus">
                  <StyledCloseButton
                    onClick={onClose}
                    disabled={!isDismissable}
                  >
                    <FontAwesomeIcon
                      icon={icon({ name: 'xmark' })}
                      font-size="1.5em"
                    />
                  </StyledCloseButton>
                </FocusRing>
              )}
              {title && <StyledTitle>{title}</StyledTitle>}
              {children}
            </StyledContent>
          </StyledWrapper>
        </FocusScope>
      </StyledBackdrop>
    </OverlayContainer>
  );
};

Modal.propTypes = {
  children: PropTypes.node,
  showCloseButton: PropTypes.bool,
  title: PropTypes.string,
  onClose: PropTypes.func,
  isDismissable: PropTypes.bool,
};

Modal.defaultProps = {
  children: null,
  showCloseButton: false,
  title: null,
  onClose: null,
  isDismissable: true,
};

export default Modal;

/* Styled Components */

const StyledBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  padding: 3em 0;
  background-color: rgba(0, 0, 0, 0.5);
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  align-items: center;
`;

const StyledWrapper = styled(motion.div)`
  outline: none;
  background-color: #ffffff;
  border-radius: 4px;
  padding: 2em;
  margin: auto;
  max-width: min(800px, calc(100vw - 1em));
  @media only screen and (max-width: 400px) {
    padding: 0.75em;
    max-width: calc(100vw - 0.25em);
  }
`;

const StyledContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  @media only screen and (max-width: 780px) {
    button {
      flex: 1;
    }
  }
`;

const StyledTitle = styled.h1`
  margin-top: 0;
  font-size: 1.5em;
`;

const StyledCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  width: 2em;
  height: 2em;
  background: none;
  border: none;
  z-index: 1;
  border-radius: 50%;
  outline: none;
  transition:
    transform 100ms ease,
    background-color 150ms ease-in;

  &.modal-close-button-focus:not(:disabled) {
    box-shadow: 0 0 0 2px #000000;
  }

  &:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:active:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;
