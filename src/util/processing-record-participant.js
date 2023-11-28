// eslint-disable-next-line import/prefer-default-export
import { ParticipantRole } from 'types/enums';
import { extractEmailFromContactDetails } from 'util/general';
import { formatUsername } from 'util/mds-api';

export const buildParticipantsInfo = (processingRecord, recordsResponse) => {
  const participantUuids =
    processingRecord['processing_record_participants.uuid'];
  return participantUuids
    .map((prpUuid) => {
      if (
        !('processing_record_participants' in recordsResponse) ||
        !('id_types' in recordsResponse) ||
        !('identifiers' in recordsResponse)
      ) {
        return null;
      }
      const processingRecordParticipant =
        recordsResponse.processing_record_participants[prpUuid];
      if (!processingRecordParticipant) {
        return null;
      }
      const identifier =
        recordsResponse.identifiers[
          processingRecordParticipant.identifier_uuid
        ];
      if (!identifier) {
        return null;
      }
      const idType = recordsResponse.id_types[identifier.id_type_uuid];
      if (!idType) {
        return null;
      }
      return {
        processingRecord,
        processingRecordParticipant,
        identifier,
        idType,
      };
    })
    .filter((data) => data !== null);
};

export const getNonDataSubjectParticipantInfos = (
  person,
  record,
  participantsArray
) => {
  let participantValues = [];
  if (record) {
    const prps = participantsArray.filter(
      (prp) => prp.role !== ParticipantRole.DATA_SUBJECT
    );
    participantValues = prps.map((prp) => ({
      id: prp.uuid,
      email: prp.notification_email_address,
      name: prp.identifier_display_name,
      status: prp.status,
      hasNoIdentifiers: false,
    }));
  }
  if (person && !record) {
    participantValues = person.guardians?.map((guardian) => ({
      id: guardian.id,
      email: extractEmailFromContactDetails(guardian),
      name: formatUsername({
        givenName: guardian.first_names,
        familyName: guardian.family_names,
      }),
      hasNoIdentifiers:
        !guardian?.identifiers || guardian.identifiers.length === 0,
    }));
    if (!participantValues) participantValues = [];
  }
  return participantValues;
};

export const addParticipantsArrayToRecords = (recordsResponse) =>
  Object.fromEntries(
    Object.values(recordsResponse.processing_records).map((record) => [
      record.uuid,
      {
        ...record,
        participants: record['processing_record_participants.uuid'].map(
          (prpUuid) => recordsResponse.processing_record_participants[prpUuid]
        ),
      },
    ])
  );
