import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import Button from 'components/button';
import Modal from 'components/modal';

const ResultModal = ({ onClose, isDismissable, isSuccess, heading, text }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Modal onClose={onClose} isDismissable={isDismissable}>
      <StyledModalInnerWrapper>
        {isSuccess ? (
          <FontAwesomeIcon
            icon={icon({ name: 'circle-check' })}
            font-size="2.5em"
            style={{ color: theme.vgGreen }}
          />
        ) : (
          <FontAwesomeIcon
            icon={icon({ name: 'circle-xmark' })}
            font-size="2.5em"
            style={{ color: theme.errorColor }}
          />
        )}
        {heading && heading.length > 0 && <h3>{heading}</h3>}
        {text && text.length > 0 && <p>{text}</p>}
      </StyledModalInnerWrapper>
      <StyledButtonArea justify="center">
        <Button
          size="small"
          variant="primary"
          text={t('labelContinue')}
          onClick={onClose}
        />
      </StyledButtonArea>
    </Modal>
  );
};

ResultModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  isSuccess: PropTypes.bool.isRequired,
  heading: PropTypes.string,
  text: PropTypes.string,
  isDismissable: PropTypes.bool,
};

ResultModal.defaultProps = {
  heading: null,
  text: null,
  isDismissable: true,
};

export default ResultModal;

/* Styled Components */

const StyledModalInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5em;
  max-width: 30em;
  text-align: center;
  h3,
  p {
    margin: 0;
  }
`;

const StyledButtonArea = styled(Button.Area)`
  margin: 2em -0.25em 0 -0.25em;
`;
