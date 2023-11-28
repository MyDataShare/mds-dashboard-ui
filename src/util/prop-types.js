import PropTypes from 'prop-types';

export const DataConsumerProp = PropTypes.shape({
  uuid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  purpose: PropTypes.string.isRequired,
  legal: PropTypes.string.isRequired,
  'metadatas.uuid': PropTypes.arrayOf(PropTypes.string).isRequired,
});

export const ExtAPIProp = PropTypes.shape({
  uuid: PropTypes.string.isRequired,
  organization_uuid: PropTypes.string.isRequired,
  ext_endpoint_type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

export const IdentifierProp = PropTypes.shape({
  id: PropTypes.string.isRequired,
  verified: PropTypes.string,
  group_id: PropTypes.number,
});

export const IdTypeProp = PropTypes.shape({
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  verify_interval: PropTypes.number,
  country: PropTypes.string,
});

export const MetadataProp = PropTypes.shape({
  uuid: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
  model_uuid: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  json_data: PropTypes.object.isRequired,
  subtype1: PropTypes.string,
  subtype2: PropTypes.string,
});

export const ParticipantInfoProp = PropTypes.shape({
  id: PropTypes.string.isRequired,
  status: PropTypes.string,
  email: PropTypes.string,
  name: PropTypes.string,
  hasNoIdentifiers: PropTypes.bool,
});

export const PersonProp = PropTypes.shape({
  id: PropTypes.string.isRequired,
});

export const ProcessingRecordProp = PropTypes.shape({
  uuid: PropTypes.string.isRequired,
  'metadatas.uuid': PropTypes.arrayOf(PropTypes.string).isRequired,
  'processing_record_participants.uuid': PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.string,
});

export const PersonRecordProp = PropTypes.shape({
  person: PersonProp.isRequired,
  records: PropTypes.arrayOf(ProcessingRecordProp).isRequired,
  participantInfos: PropTypes.arrayOf(ParticipantInfoProp),
});

export const ProcessingRecordParticipantProp = PropTypes.shape({
  uuid: PropTypes.string.isRequired,
  identifier_uuid: PropTypes.string.isRequired,
  processing_record_uuid: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  identifier_display_name: PropTypes.string,
  notification_email_address: PropTypes.string,
});

export const RecordStatsProp = PropTypes.shape({
  all: PropTypes.arrayOf(PersonRecordProp),
  targeted: PropTypes.arrayOf(PersonRecordProp),
  notTargeted: PropTypes.arrayOf(PersonRecordProp),
  notInTargetGroup: PropTypes.arrayOf(PersonRecordProp),
  pending: PropTypes.arrayOf(PersonRecordProp),
  active: PropTypes.arrayOf(PersonRecordProp),
  declined: PropTypes.arrayOf(PersonRecordProp),
  expired: PropTypes.arrayOf(PersonRecordProp),
  withdrawn: PropTypes.arrayOf(PersonRecordProp),
});
