export enum AccessStatus {
  COMPLETED = 'completed',
  INTROSPECTED = 'introspected',
}

export enum ActivationMode {
  DATA_SUBJECT_ACTIVATES = 'data_subject_activates',
  ALL_ACTIVATORS_ACTIVATE = 'all_activators_activate',
  ANY_ACTIVATOR_ACTIVATES = 'any_activator_activates',
  AUTOMATICALLY_ACTIVATED = 'automatically_activated',
}

export enum Method {
  GET = 'GET',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  POST = 'POST',
}

export enum Model {
  ACCESS_GATEWAY = 'access_gateway',
  DATA_CONSUMER = 'data_consumer',
  DATA_PROVIDER = 'data_provider',
  METADATA = 'metadata',
  ORGANIZATION_IDENTIFIER = 'organization_identifier',
  ORGANIZATION = 'organization',
}

export enum OrganizationIdentifierRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum ParticipantRole {
  ACTIVATOR = 'activator',
  DATA_SUBJECT = 'data_subject',
}

export enum ParticipantStatus {
  ACTIVE = 'active',
  DECLINED = 'declined',
  NOT_APPLICABLE = 'not_applicable',
  PENDING = 'pending',
}

export enum RecordType {
  CONSENT = 'consent',
  LEGAL_OBLIGATION = 'legal_obligation',
  LEGITIMATE_INTEREST = 'legitimate_interest',
  MDS_CONTRACT_TOS = 'mds_contract_tos',
  SERVICE_TOS = 'service_tos',
}

export enum RecordStatus {
  ACTIVE = 'active',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  WITHDRAWN = 'withdrawn',
}

export enum TerminalStatus {
  EXPIRES = RecordStatus.EXPIRED,
  WITHDRAWN = RecordStatus.WITHDRAWN,
}
