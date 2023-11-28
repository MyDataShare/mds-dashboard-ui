import { useMutation, useQuery } from '@tanstack/react-query';
import { sendEmail } from 'api';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory } from 'react-router-dom';

import { createProcessingRecord } from 'api/create';
import { fetchDataConsumer } from 'api/get';
import Breadcrumbs from 'components/breadcrumbs';
import DateTime from 'components/date-time';
import Form from 'components/form';
import IdentifierInputs from 'components/identifier-inputs';
import Input from 'components/input';
import Loading from 'components/loading';
import { useAuth } from 'context/auth';
import { useTitle } from 'hooks';
import { ParticipantRole, RecordType } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { addDaysToDate, toISODate } from 'util/date';
import { removeEmptyFields } from 'util/form';
import { getDataConsumers, getMetadata } from 'util/mds-api';

const ProcessingRecordCreate = ({ match }) => {
  // TODO: How to get invalidateQueries?
  // TODO: Needs adaptation to multi participants, now only data subject supported
  const { t } = useTranslation();
  useTitle('pageTitleProcessingRecordCreate', t);
  const history = useHistory();
  const { uuid } = match.params;
  const { user } = useAuth();
  const sendNotificationMutation = useMutation((prUuid) => sendEmail(prUuid));
  const emailGatewayMeta = getMetadata(
    user.organization,
    'email_gateway',
    user.metadatas
  );
  const canSendEmails = !!emailGatewayMeta;
  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey: ['dataConsumer', { uuid }],
    queryFn: fetchDataConsumer,
  });

  if (isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1 id="heading-create-pr">{t('headingProcessingRecordCreate')}</h1>
        <Loading />
      </>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const dataConsumer = getDataConsumers(data)[0];
  const disableCreateView = !!dataConsumer.ext_api_uuid;
  if (disableCreateView) {
    return <Redirect to="../members" />;
  }
  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-create-pr">{t('headingProcessingRecordCreate')}</h1>
      <Form
        submitLabel="labelFormCreate"
        invalidateQueries={['processingRecord']}
        onCancel={() => history.replace('.')}
        mutationFn={async (args) => {
          const idType =
            args.payload.processingRecord.participants[0].identifier.type;
          if (idType === 'ssn__swe' || idType === 'ssn__fin') {
            // eslint-disable-next-line no-param-reassign
            args.payload.processingRecord.participants[0].identifier.type =
              'ssn';
          }
          removeEmptyFields(args.payload.processingRecord);
          removeEmptyFields(args.payload.processingRecord.participants[0]);

          if (args.payload.processingRecord.expires) {
            // eslint-disable-next-line no-param-reassign
            args.payload.processingRecord.expires = toISODate(
              args.payload.processingRecord.expires
            );
          }

          // Normally page navigations and other side effects after a successful mutation
          // should be done in the onSuccess callback, but since we need to conditionally
          // do more mutations and navigation depending on the "main" mutation, it's
          // easier to handle all this logic in the mutation function than to pass all
          // data to onSuccess and continue there.
          const { status, data: prData } = await createProcessingRecord(args);
          // If this organization can send emails, the PR type is consent and a contact email
          // address was given, send a notification email after creation.
          const sendEmailOnCreate =
            canSendEmails &&
            !!args.payload.processingRecord.participants[0]
              .notification_email_address &&
            dataConsumer.record_type === RecordType.CONSENT;
          const prUuid = Object.keys(prData.processing_records)[0];
          if (status === 200) {
            // eslint-disable-next-line no-alert
            if (window.confirm(t('textRecordAlreadyExistQuestion'))) {
              history.replace(`./${prUuid}`);
            }
          } else if (status === 201) {
            if (sendEmailOnCreate) {
              await sendNotificationMutation.mutateAsync(prUuid);
            }
            history.replace(`./${prUuid}`);
          }
        }}
      >
        <FormContent
          dataConsumer={dataConsumer}
          canSendEmails={canSendEmails}
        />
      </Form>
    </>
  );
};

ProcessingRecordCreate.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

const FormContent = ({ dataConsumer, canSendEmails }) => {
  const { t } = useTranslation();
  return (
    <>
      <Input
        name="processingRecord.data_consumer_uuid"
        id="processingRecord.data_consumer_uuid"
        value={dataConsumer.uuid}
        type="hidden"
        hidden
      />
      <Input
        name="processingRecord.data_provider_uuid"
        id="processingRecord.data_provider_uuid"
        value={dataConsumer.data_provider_uuid}
        type="hidden"
        hidden
      />
      <DateTime
        name="processingRecord.expires"
        id="processingRecord.expires"
        label={t('expires')}
        options={{ minDate: addDaysToDate(new Date(), 1) }}
      />
      <Input
        name="processingRecord.reference"
        id="processingRecord.reference"
        help={t('textHelpReference')}
        label={t('labelReference')}
      />
      <h2>{t('headingDataSubject')}</h2>
      <IdentifierInputs namePrefix="processingRecord.participants.0" />
      <Input
        name="processingRecord.participants.0.identifier_display_name"
        id="processingRecord.participants.0.identifier_display_name"
        label={t('labelIdentifierDisplayName')}
        required
      />
      <Input
        name="processingRecord.participants.0.role"
        id="processingRecord.participants.0.role"
        value={ParticipantRole.DATA_SUBJECT}
        type="hidden"
        hidden
      />
      {canSendEmails && dataConsumer.record_type === RecordType.CONSENT && (
        <Input
          name="processingRecord.participants.0.notification_email_address"
          id="processingRecord.participants.0.notification_email_address"
          label={t('labelNotificationEmail')}
          help={t('textHelpNotificationEmail')}
          type="email"
        />
      )}
    </>
  );
};

FormContent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  dataConsumer: PropTypes.object.isRequired,
  canSendEmails: PropTypes.bool.isRequired,
};

export default ProcessingRecordCreate;
