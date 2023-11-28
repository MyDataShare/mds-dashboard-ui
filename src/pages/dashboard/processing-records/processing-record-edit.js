import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { fetchProcessingRecord } from 'api/get';
import { patchProcessingRecordParticipant } from 'api/modify';
import AnnouncingLink from 'components/announcing-link';
import Breadcrumbs from 'components/breadcrumbs';
import Form from 'components/form';
import IconText from 'components/icon-text';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import { useAuth } from 'context/auth';
import { useTitle } from 'hooks';
import ParticipantDetailsCard from 'pages/dashboard/processing-records/components/participant-details-card';
import { ParticipantRole, RecordStatus } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getApiObject, getEmailGateway, getMetadatas } from 'util/mds-api';
import { getRecordStatusIcon, getRecordTypeIcon } from 'util/processing-record';
import { buildParticipantsInfo } from 'util/processing-record-participant';

const ProcessingRecordEdit = ({ match }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { user } = useAuth();
  useTitle('pageTitleProcessingRecordEdit', t);
  const { uuid } = match.params;
  const queryKey = ['processingRecord', { uuid }];
  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey,
    queryFn: fetchProcessingRecord,
  });
  const processingRecord = getApiObject(data.processing_records);

  if (
    [RecordStatus.WITHDRAWN, RecordStatus.EXPIRED].includes(
      processingRecord?.status
    )
  ) {
    return <Redirect to="./" />;
  }

  const dataConsumer =
    data?.data_consumers?.[processingRecord.data_consumer_uuid];
  const dataProvider =
    data?.data_providers?.[processingRecord.data_provider_uuid];
  if (isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1 id="heading-edit-pr">{t('headingProcessingRecordEdit')}</h1>
        <Loading />
      </>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  if (dataConsumer?.organization_uuid !== user.organization.uuid) {
    throw new Error('errorNoPermission');
  }
  const participantsInfo = buildParticipantsInfo(processingRecord, data);
  const dataSubjectInfo = participantsInfo.find(
    ({ processingRecordParticipant }) =>
      processingRecordParticipant.role === ParticipantRole.DATA_SUBJECT
  );
  const emailGatewayMeta = getEmailGateway(user);
  const canSendEmails = !!emailGatewayMeta;
  const metadatas = getMetadatas(data);
  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-edit-pr">{t('headingProcessingRecordEdit')}</h1>
      <Form
        invalidateQueries={queryKey}
        onSuccess={() => history.replace('.')}
        onCancel={() => history.push('.')}
        mutationFn={async ({ payload }) =>
          Promise.all(
            Object.entries(payload.processingRecordParticipants).map(
              async ([prpUuid, values]) => {
                const participant = participantsInfo.find(
                  ({ processingRecordParticipant: prp }) => prp.uuid === prpUuid
                ).processingRecordParticipant;
                const formName = values.identifier_display_name?.trim() || null;
                const formEmail =
                  values.notification_email_address?.trim() || null;
                if (
                  formName !== participant.identifier_display_name ||
                  formEmail !== participant.notification_email_address
                ) {
                  return patchProcessingRecordParticipant({
                    processingRecordParticipant: participant,
                    payload: {
                      processingRecordParticipant: {
                        identifier_display_name: formName,
                        notification_email_address: formEmail,
                      },
                    },
                  });
                }
                return Promise.resolve(null);
              }
            )
          )
        }
      >
        <LabeledValue label={t('uuid')} value={processingRecord.uuid} />
        <LabeledValue
          label={t('created')}
          value={formatDate(processingRecord.created)}
        />
        <LabeledValue
          label={t('updated')}
          value={formatDate(processingRecord.updated)}
        />
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
            notificationSupported={canSendEmails}
            form
          />
          {participantsInfo
            .filter(
              ({ processingRecordParticipant }) =>
                processingRecordParticipant.role !==
                ParticipantRole.DATA_SUBJECT
            )
            .map((info) => (
              <ParticipantDetailsCard
                key={info.processingRecordParticipant.uuid}
                {...info}
                metadatas={metadatas}
                activationMode={dataConsumer.activation_mode}
                notificationSupported={canSendEmails}
                form
              />
            ))}
        </StyledParticipantsWrapper>
      </Form>
    </>
  );
};

ProcessingRecordEdit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProcessingRecordEdit;

/* Styled Components */

const StyledParticipantsWrapper = styled.div`
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  margin-top: 1em;
`;
