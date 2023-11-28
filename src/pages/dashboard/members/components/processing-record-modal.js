import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from '@tanstack/react-query';
import { alpha2ToAlpha3 } from 'i18n-iso-countries';
import PropTypes from 'prop-types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { createProcessingRecordBatch } from 'api/create';
import Button from 'components/button';
import DateTime from 'components/date-time';
import Modal from 'components/modal';
import PersonAccordion from 'components/person-accordion';
import ResultModal from 'components/result-modal';
import SpinnerIcon from 'components/spinner-icon';
import StyledButtonArea from 'pages/dashboard/members/components/styled-button-area';
import { ActivationMode, ParticipantRole } from 'types/enums';
import { addDaysToDate, toISODate } from 'util/date';
import { extractEmailFromContactDetails } from 'util/general';
import { formatUsername } from 'util/mds-api';
import { PersonRecordProp } from 'util/prop-types';
import { camelToSnake } from 'util/string';

const ProcessingRecordModal = ({
  dc,
  personsAndRecords,
  metadatas,
  onClose,
  onCreateSuccess,
}) => {
  const { t } = useTranslation();
  const methods = useForm({ shouldUnregister: true });

  const createRecordMutation = useMutation(async ({ expires, targets }) => {
    const participants = targets.map(({ person }) =>
      buildRecordPayloadParticipants(dc.activation_mode, person)
    );
    const payload = {
      data_consumer_uuid: dc.uuid,
      participants_per_record: participants,
    };
    if (dc.data_provider_uuid) {
      payload.data_provider_uuid = dc.data_provider_uuid;
    }
    if (expires) {
      payload.expires = expires;
    }
    return createProcessingRecordBatch({
      payload: { processingRecord: payload },
    });
  });

  if (personsAndRecords.length === 0) return null;
  const targetableRows = personsAndRecords.filter(
    ({ records, participantInfos }) =>
      !participantInfos.find((info) => !!info.hasNoIdentifiers) &&
      records.length === 0
  );
  const untargetableRows = personsAndRecords.filter(
    ({ records, participantInfos }) =>
      participantInfos.find((info) => !!info.hasNoIdentifiers) ||
      records.length > 0
  );
  const onCloseResultModal = () => {
    if (createRecordMutation.isSuccess) {
      onCreateSuccess();
    }
    createRecordMutation.reset();
    return onClose();
  };
  if (createRecordMutation.isSuccess || createRecordMutation.isError) {
    const textParams = { count: targetableRows.length };
    return (
      <ResultModal
        onClose={onCloseResultModal}
        isDismissable={!createRecordMutation.isLoading}
        isSuccess={createRecordMutation.isSuccess}
        heading={t(
          `headingRecordCreate${
            createRecordMutation.isSuccess ? 'Success' : 'Error'
          }`,
          textParams
        )}
        text={t(
          `textRecordCreate${
            createRecordMutation.isSuccess ? 'Success' : 'Error'
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
      isDismissable={!createRecordMutation.isLoading}
      title={t('headingCreateProcessingRecords')}
    >
      <p>{t('textConfirmCreateProcessingRecordsIntro')}</p>
      <PersonAccordion
        personsAndRecords={targetableRows}
        metadatas={metadatas}
        collapsed={false}
        heading={t('headingBatchPrTargets', { count: targetableRows.length })}
      />
      {untargetableRows.length > 0 && (
        <PersonAccordion
          personsAndRecords={untargetableRows}
          metadatas={metadatas}
          heading={t('headingBatchPrTargetsSkipped', {
            count: untargetableRows.length,
          })}
          info={t('textBatchPrTargetsSkippedInfo')}
        />
      )}
      <FormProvider {...methods}>
        <StyledForm>
          <DateTime
            name="expires"
            id="expires"
            label={t('expires')}
            options={{ minDate: addDaysToDate(new Date(), 1) }}
          />
        </StyledForm>
      </FormProvider>
      <StyledButtonArea>
        <Button
          size="small"
          variant="secondary"
          text={t('labelCancel')}
          onClick={onClose}
          disabled={createRecordMutation.isLoading}
        />
        <Button
          variant="primary"
          size="small"
          id="btn-modal-create-prs"
          text={t('labelCreateProcessingRecords')}
          icon={
            createRecordMutation.isLoading ? (
              <SpinnerIcon />
            ) : (
              <FontAwesomeIcon icon={icon({ name: 'plus' })} />
            )
          }
          // onClick={() => createRecordMutation.mutate(untargetedRows)}
          onClick={methods.handleSubmit((formValues) => {
            let expires = null;
            if (formValues.expires) {
              expires = toISODate(formValues.expires);
            }
            createRecordMutation.mutate({ expires, targets: targetableRows });
          })}
          type="submit"
          disabled={createRecordMutation.isLoading}
        />
      </StyledButtonArea>
    </Modal>
  );
};

ProcessingRecordModal.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  dc: PropTypes.object.isRequired,
  personsAndRecords: PropTypes.arrayOf(PersonRecordProp).isRequired,
  metadatas: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateSuccess: PropTypes.func.isRequired,
};

export default ProcessingRecordModal;

/* Helpers */

const buildIdentifierPayload = (person) => {
  const ret = {
    identifier_display_name: formatUsername({
      givenName: person.first_names,
      familyName: person.family_names,
    }),
    notification_email_address: extractEmailFromContactDetails(person),
  };

  // Kasko ID is first priority
  const personKaskoId = person.identifiers.find(
    (id_) => camelToSnake(id_.type) === 'kasko_id'
  );
  if (personKaskoId) {
    ret.identifier = {
      id: personKaskoId.id,
      type: 'kasko_id',
    };
    return ret;
  }

  // Finnish SSN is second priority
  const personSsnFin = person.identifiers.find(
    (id_) => id_.type === 'ssn' && alpha2ToAlpha3(id_.country) === 'FIN'
  );
  if (personSsnFin) {
    ret.identifier = {
      id: personSsnFin.id,
      type: 'ssn',
      country: 'FIN',
    };
    return ret;
  }

  // Fall back to any identifier without checking its type
  const personFallbackId = person.identifiers[0];
  ret.identifier = {
    id: personFallbackId.id,
    type: camelToSnake(personFallbackId.type),
  };
  if (personFallbackId.country) {
    ret.identifier.country = alpha2ToAlpha3(personFallbackId.country);
  }
  return ret;
};

const buildRecordPayloadParticipants = (activationMode, person) => {
  let ret = [
    {
      ...buildIdentifierPayload(person),
      role: ParticipantRole.DATA_SUBJECT,
    },
  ];
  // TODO: We should adapt to guardians not having identifiers. Batch PR create API gives us error
  //       reasons generally, but not if we leave out identifiers from payload... then we just get
  //       400 bad request. So handle this in getTargetableRows?
  if (
    activationMode !== ActivationMode.DATA_SUBJECT_ACTIVATES &&
    Array.isArray(person.guardians)
  ) {
    ret = ret.concat(
      person.guardians.map((guardian) => ({
        ...buildIdentifierPayload(guardian),
        role: ParticipantRole.ACTIVATOR,
      }))
    );
  }
  return ret;
};

/* Styled Components */

const StyledForm = styled.div`
  margin-top: 1em;
`;
