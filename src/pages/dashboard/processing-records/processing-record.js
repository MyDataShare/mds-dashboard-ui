import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendEmail } from 'api';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fetchProcessingRecord } from 'api/get';
import { patchProcessingRecord } from 'api/modify';
import AnnouncingLink from 'components/announcing-link';
import Breadcrumbs from 'components/breadcrumbs';
import Button from 'components/button';
import IconText from 'components/icon-text';
import InlineHeadingWrapper from 'components/inline-heading-wrapper';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import SpinnerIcon from 'components/spinner-icon';
import { useAuth } from 'context/auth';
import { useTitle } from 'hooks';
import ParticipantDetailsCard from 'pages/dashboard/processing-records/components/participant-details-card';
import { ParticipantRole, RecordStatus } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import {
  getApiObject,
  getEmailGateway,
  getMetadatas,
  isNotifiable,
} from 'util/mds-api';
import { getRecordStatusIcon, getRecordTypeIcon } from 'util/processing-record';
import { buildParticipantsInfo } from 'util/processing-record-participant';

const ProcessingRecord = ({ match }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  useTitle('pageTitleProcessingRecord', t);
  const { uuid } = match.params;
  const queryClient = useQueryClient();
  const queryKey = ['processingRecord', { uuid }];
  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey,
    queryFn: fetchProcessingRecord,
    refetchInterval: 5000, // Add polling, so that we get up-to-date email notification history
    refetchIntervalInBackground: false,
  });
  const patchMutation = useMutation((args) => patchProcessingRecord(args), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  const {
    mutate: mutateEmail,
    isLoading: isLoadingEmail,
    isError: isErrorEmail,
  } = useMutation(() => sendEmail(uuid));

  const onWithdraw = (processingRecord, payload) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(t('textConfirmWithdraw'))) {
      patchMutation.mutate({ processingRecord, payload });
    }
  };

  if (isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1 id="heading-pr">{t('headingProcessingRecord')}</h1>
        <Loading />
      </>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const processingRecord = getApiObject(data.processing_records);
  const dataConsumer = data.data_consumers[processingRecord.data_consumer_uuid];
  const dataProvider = processingRecord.data_provider_uuid
    ? data.data_providers[processingRecord.data_provider_uuid]
    : null;
  // TODO: Show warning icons next to DC and DP if they're suspended?
  const showWithdrawButton =
    dataConsumer.organization_uuid === user.organization.uuid &&
    [
      RecordStatus.ACTIVE,
      RecordStatus.DECLINED,
      RecordStatus.EXPIRED,
      RecordStatus.PENDING,
      RecordStatus.SUSPENDED,
    ].includes(processingRecord.status);
  const metadatas = getMetadatas(data);
  const participantsInfo = buildParticipantsInfo(processingRecord, data);
  const dataSubjectInfo = participantsInfo.find(
    ({ processingRecordParticipant }) =>
      processingRecordParticipant.role === ParticipantRole.DATA_SUBJECT
  );
  const allParticipants = participantsInfo.map(
    ({ processingRecordParticipant }) => processingRecordParticipant
  );
  const isPrNotifiable = isNotifiable(
    user,
    dataConsumer,
    processingRecord,
    allParticipants
  );
  const notificationSupported = !!getEmailGateway(user);
  return (
    <>
      <Breadcrumbs />
      <InlineHeadingWrapper>
        <h1 id="heading-pr">{t('headingProcessingRecord')}</h1>
        {user.organization.uuid === dataConsumer.organization_uuid &&
          ![RecordStatus.EXPIRED, RecordStatus.WITHDRAWN].includes(
            processingRecord.status
          ) && (
            <Button
              id="btn-edit-pr"
              variant="secondary"
              text={t('labelEdit')}
              to={`${match.url}/edit`}
              size="small"
            />
          )}
      </InlineHeadingWrapper>
      <LabeledValue label={t('uuid')} value={processingRecord.uuid} />
      <LabeledValue
        label={t('labelDataConsumer')}
        value={
          dataConsumer.organization_uuid === user.organization.uuid ? (
            <AnnouncingLink to={`/dataConsumers/${dataConsumer.uuid}`}>
              {dataConsumer.name}
            </AnnouncingLink>
          ) : (
            dataConsumer.name
          )
        }
      />
      <LabeledValue
        label={t('labelDataProvider')}
        value={
          dataProvider ? (
            <AnnouncingLink to={`/dataProviders/${dataProvider.uuid}`}>
              {dataProvider.name}
            </AnnouncingLink>
          ) : null
        }
      />
      <LabeledValue
        label={t('record_type')}
        value={
          <IconText
            icon={getRecordTypeIcon(processingRecord.record_type)}
            text={t(processingRecord.record_type)}
          />
        }
      />
      <LabeledValue
        label={t('status')}
        value={
          <IconText
            icon={getRecordStatusIcon(processingRecord.status)}
            text={t(processingRecord.status)}
          />
        }
      />
      <LabeledValue
        label={t('expires')}
        value={formatDate(processingRecord.expires)}
      />
      <LabeledValue
        label={t('not_valid_before')}
        value={formatDate(processingRecord.not_valid_before)}
      />
      <LabeledValue
        label={t('labelReference')}
        value={processingRecord.reference}
      />
      <h2>{t('headingParticipants')}</h2>
      <StyledParticipantsWrapper>
        <ParticipantDetailsCard
          {...dataSubjectInfo}
          metadatas={metadatas}
          activationMode={dataConsumer.activation_mode}
          notificationSupported={notificationSupported}
        />
        {participantsInfo
          .filter(
            ({ processingRecordParticipant }) =>
              processingRecordParticipant.role !== ParticipantRole.DATA_SUBJECT
          )
          .map((info) => (
            <ParticipantDetailsCard
              key={info.processingRecordParticipant.uuid}
              {...info}
              metadatas={metadatas}
              activationMode={dataConsumer.activation_mode}
              isErrorEmail={isErrorEmail}
              notificationSupported={notificationSupported}
            />
          ))}
      </StyledParticipantsWrapper>
      <h2>{t('headingOtherInformation')}</h2>
      <LabeledValue
        label={t('created')}
        value={formatDate(processingRecord.created)}
      />
      <LabeledValue
        label={t('updated')}
        value={formatDate(processingRecord.updated)}
      />
      {(showWithdrawButton || isPrNotifiable) && (
        <>
          <hr />
          <h2>{t('headingActions')}</h2>
          {isPrNotifiable && (
            <>
              <h3>{t('headingSendEmailNotification')}</h3>
              <p>{t('sendEmailNotificationParagraph')}</p>
              <StyledNotificationActionsWrapper>
                <Button
                  id="btn-send-email-notification"
                  text={t('labelSendEmailNotification', {
                    count: allParticipants.length,
                  })}
                  type="button"
                  variant="secondary"
                  size="small"
                  icon={
                    isLoadingEmail ? (
                      <SpinnerIcon />
                    ) : (
                      <FontAwesomeIcon icon={icon({ name: 'bell' })} />
                    )
                  }
                  disabled={isLoadingEmail || !isPrNotifiable}
                  onClick={mutateEmail}
                />
              </StyledNotificationActionsWrapper>
            </>
          )}
          {showWithdrawButton && (
            <>
              <h3>{t('headingWithdrawProcessingRecord')}</h3>
              <p>{t('withdrawProcessingRecordParagraph')}</p>
              <Button
                id="btn-withdraw"
                text={t('labelWithdraw')}
                type="button"
                variant="secondary"
                colorVariant="negative"
                icon={<FontAwesomeIcon icon={icon({ name: 'box-archive' })} />}
                size="small"
                onClick={() =>
                  onWithdraw(processingRecord, {
                    processingRecord: {
                      terminal_status: RecordStatus.WITHDRAWN,
                    },
                  })
                }
              />
            </>
          )}
        </>
      )}
    </>
  );
};

ProcessingRecord.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProcessingRecord;

/* Styled Components */

const StyledNotificationActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 2em;
  flex-wrap: wrap-reverse;
`;

const StyledParticipantsWrapper = styled.div`
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  margin-top: 1em;
`;
