import { getTranslation, LANGUAGES } from 'mydatashare-core';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import IconText from 'components/icon-text';
import Input from 'components/input';
import LabeledValue from 'components/labeled-value';
import NotificationInfo from 'pages/dashboard/processing-records/components/notification-info';
import { ActivationMode, ParticipantRole } from 'types/enums';
import { getLatestParticipantNotification } from 'util/mds-api';
import {
  getParticipantIcon,
  getRecordStatusIcon,
} from 'util/processing-record';
import {
  IdentifierProp,
  IdTypeProp,
  MetadataProp,
  ProcessingRecordParticipantProp,
} from 'util/prop-types';

const ParticipantDetailsCard = ({
  processingRecordParticipant,
  identifier,
  idType,
  metadatas,
  activationMode,
  isErrorEmail,
  notificationSupported,
  form,
}) => {
  const { t, i18n } = useTranslation();
  const email = processingRecordParticipant.notification_email_address;
  const {
    date: notificationLastAttemptDate,
    status: notificationLastAttemptStatus,
  } = getLatestParticipantNotification(processingRecordParticipant, metadatas);
  const isNotificationError =
    notificationLastAttemptStatus !== 200 || isErrorEmail;
  const showStatus = !(
    processingRecordParticipant.role === ParticipantRole.DATA_SUBJECT &&
    activationMode !== ActivationMode.DATA_SUBJECT_ACTIVATES
  );
  const StatusComponent = (
    <LabeledValue
      label={t('status')}
      value={
        <IconText
          icon={getRecordStatusIcon(processingRecordParticipant.status)}
          text={t(processingRecordParticipant.status)}
        />
      }
    />
  );
  return (
    <StyledParticipantDetailsWrapper>
      <StyledParticipantHeaderRow>
        {form ? (
          <StyledInput
            name={`processingRecordParticipants.${processingRecordParticipant.uuid}.identifier_display_name`}
            id={`processingRecordParticipants.${processingRecordParticipant.uuid}.identifier_display_name`}
            label={t('labelIdentifierDisplayName')}
            value={processingRecordParticipant.identifier_display_name}
            placeholder={processingRecordParticipant.identifier_display_name}
            required
          />
        ) : (
          <StyledName>
            {processingRecordParticipant.identifier_display_name || (
              <i>{t('labelNameNotAvailable')}</i>
            )}
          </StyledName>
        )}
        <StyledRole>
          <IconText
            icon={getParticipantIcon(processingRecordParticipant)}
            text={t(processingRecordParticipant.role)}
          />
        </StyledRole>
      </StyledParticipantHeaderRow>
      {showStatus && !form && StatusComponent}
      <>
        {notificationSupported && form ? (
          <StyledInput
            name={`processingRecordParticipants.${processingRecordParticipant.uuid}.notification_email_address`}
            id={`processingRecordParticipants.${processingRecordParticipant.uuid}.notification_email_address`}
            label={t('labelNotificationEmail')}
            value={processingRecordParticipant.notification_email_address}
            placeholder={processingRecordParticipant.notification_email_address}
            type="email"
          />
        ) : (
          <LabeledValue
            label={t('labelNotificationEmail')}
            value={processingRecordParticipant.notification_email_address}
          />
        )}
        {notificationSupported &&
          !form &&
          (notificationLastAttemptDate || isErrorEmail) && (
            <NotificationInfo
              email={email}
              notificationDate={
                isErrorEmail ? Date() : notificationLastAttemptDate
              }
              isNotificationError={isNotificationError}
            />
          )}
      </>
      {showStatus && form && StatusComponent}
      <LabeledValue
        sensitive
        label={t('labelIdentifierId')}
        value={identifier.id}
      />
      <LabeledValue
        label={t('labelIdTypeName')}
        value={getTranslation(
          idType,
          'name',
          LANGUAGES[i18n.language],
          metadatas
        )}
      />
      <LabeledValue
        label={t('country')}
        value={idType.country ? t(idType.country) : null}
      />
      <LabeledValue label={t('verified')} value={identifier.verified} />
      <LabeledValue label={t('group_id')} value={identifier.group_id} />
    </StyledParticipantDetailsWrapper>
  );
};

ParticipantDetailsCard.propTypes = {
  processingRecordParticipant: ProcessingRecordParticipantProp.isRequired,
  identifier: IdentifierProp.isRequired,
  idType: IdTypeProp.isRequired,
  metadatas: PropTypes.arrayOf(MetadataProp).isRequired,
  activationMode: PropTypes.oneOf([
    ActivationMode.DATA_SUBJECT_ACTIVATES,
    ActivationMode.ANY_ACTIVATOR_ACTIVATES,
    ActivationMode.ALL_ACTIVATORS_ACTIVATE,
  ]).isRequired,
  isErrorEmail: PropTypes.bool,
  notificationSupported: PropTypes.bool,
  form: PropTypes.bool,
};

ParticipantDetailsCard.defaultProps = {
  isErrorEmail: false,
  notificationSupported: false,
  form: false,
};

export default ParticipantDetailsCard;

/* Styled Components */

const StyledFlexRow = styled.div`
  display: flex;
  gap: 1em;
  justify-content: space-between;
  align-items: center;
`;

const StyledParticipantHeaderRow = styled(StyledFlexRow)`
  margin-bottom: 0.5em;
`;

const StyledParticipantDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  background-color: ${(p) => p.theme.grey200};
  width: 100%;
  max-width: 30em;
  padding: 1em;
  border-radius: 0.75em;
`;

const StyledName = styled.div`
  font-weight: ${(p) => p.theme.fontSemiBold};
`;

const StyledRole = styled.div`
  color: ${(p) => p.theme.grey900};
`;

const StyledInput = styled(Input)`
  flex-grow: 1;
`;
