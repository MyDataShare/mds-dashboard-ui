import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from '@tanstack/react-query';
import { sendEmail } from 'api';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/button';
import Modal from 'components/modal';
import PersonAccordion from 'components/person-accordion';
import ResultModal from 'components/result-modal';
import SpinnerIcon from 'components/spinner-icon';
import StyledButtonArea from 'pages/dashboard/members/components/styled-button-area';
import { RecordStatus } from 'types/enums';
import { PersonRecordProp } from 'util/prop-types';

const EmailNotificationModal = ({ personsAndRecords, metadatas, onClose }) => {
  const { t } = useTranslation();
  const sendEmailsMutation = useMutation(async ({ targets }) =>
    Promise.all(targets.map(async ({ records }) => sendEmail(records[0].uuid)))
  );

  if (personsAndRecords.length === 0) return null;

  const notifiableRows = [];
  const notNotifiableRows = [];
  personsAndRecords.forEach((row) => {
    const { records } = row;
    if (records.length === 0 || records[0].status !== RecordStatus.PENDING) {
      notNotifiableRows.push(row);
    } else {
      const canNotify = !!records[0].participants.find(
        (prp) => prp.notification_email_address
      );
      if (canNotify) {
        notifiableRows.push(row);
      } else {
        notNotifiableRows.push(row);
      }
    }
  });
  const onCloseResultModal = () => {
    sendEmailsMutation.reset();
    return onClose();
  };
  if (sendEmailsMutation.isSuccess || sendEmailsMutation.isError) {
    const textParams = { count: notifiableRows.length };
    return (
      <ResultModal
        onClose={onCloseResultModal}
        isDismissable={!sendEmailsMutation.isLoading}
        isSuccess={sendEmailsMutation.isSuccess}
        heading={t(
          `headingSendEmailNotification${
            sendEmailsMutation.isSuccess ? 'Success' : 'Error'
          }`,
          textParams
        )}
        text={t(
          `textSendEmailNotification${
            sendEmailsMutation.isSuccess ? 'Success' : 'Error'
          }`,
          textParams
        )}
      />
    );
  }
  return (
    <Modal
      showCloseButton
      onClose={onClose}
      title={t('headingSendEmailNotifications')}
      isDismissable={!sendEmailsMutation.isLoading}
    >
      <p>{t('textConfirmSendEmailNotificationsIntro')}</p>
      <PersonAccordion
        personsAndRecords={notifiableRows}
        metadatas={metadatas}
        collapsed={false}
        heading={t('headingEmailNotificationTargets', {
          count: notifiableRows.length,
        })}
      />
      {notNotifiableRows.length > 0 && (
        <PersonAccordion
          personsAndRecords={notNotifiableRows}
          metadatas={metadatas}
          heading={t('headingEmailNotificationTargetsSkipped', {
            count: notNotifiableRows.length,
          })}
          info={t('textEmailNotificationTargetsSkippedInfo')}
        />
      )}
      <StyledButtonArea>
        <Button
          size="small"
          variant="secondary"
          text={t('labelCancel')}
          onClick={onClose}
        />
        <Button
          variant="primary"
          size="small"
          id="btn-modal-send-email-notifications"
          text={t('labelSendEmailNotifications')}
          icon={
            sendEmailsMutation.isLoading ? (
              <SpinnerIcon />
            ) : (
              <FontAwesomeIcon icon={icon({ name: 'bell' })} />
            )
          }
          onClick={() => sendEmailsMutation.mutate({ targets: notifiableRows })}
          disabled={sendEmailsMutation.isLoading}
        />
      </StyledButtonArea>
    </Modal>
  );
};

EmailNotificationModal.propTypes = {
  personsAndRecords: PropTypes.arrayOf(PersonRecordProp).isRequired,
  metadatas: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EmailNotificationModal;

/* Styled Components */
