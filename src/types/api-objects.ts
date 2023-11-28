import {
  AccessStatus,
  ActivationMode,
  OrganizationIdentifierRole,
  ParticipantRole,
  ParticipantStatus,
  RecordStatus,
  RecordType,
  TerminalStatus,
} from 'types/enums';

interface Base {
  uuid: string;
  created: string;
  updated: string;
  suppressed_fields: string[];
}

interface Meta {
  'metadatas.uuid': Base['uuid'][];
}

export interface AccessGateway extends Base, Meta {
  organization_uuid: Base['uuid'];
}

export interface AccessItem extends Base {
  deleted: boolean;
  identifier_uuid: Base['uuid'];
  introspection_status: RecordStatus;
  reason: string;
  request_id: string;
  success: boolean;
  status: AccessStatus;
}

export interface AuthItem extends Base {
  deleted: boolean;
  id_provider_uuid: Base['uuid'];
  auth_params: string;
  name: string;
  description: string;
  url_group_id: number;
  translation_id: number;
}

export interface DataConsumer extends Base, Meta {
  data_provider_uuid: Base['uuid'] | null;
  default_language: string;
  description: string;
  ext_api_uuid: Base['uuid'] | null;
  legal: string;
  major_version: number;
  minor_version: number;
  name: string;
  organization_uuid: Base['uuid'];
  post_cancellation?: string | null;
  pre_cancellation?: string | null;
  purpose: string;
  record_type: RecordType;
  activation_mode: ActivationMode;
  suspended: boolean;
}

export interface DataProvider extends Base, Meta {
  access_gateway_uuid: Base['uuid'];
  default_language: string;
  deleted: boolean;
  description: string;
  has_live_preview: boolean;
  'input_id_types.uuid': Base['uuid'][];
  input_pr_identifier: boolean;
  major_version: number;
  minor_version: number;
  name: string;
  organization_uuid: Base['uuid'];
  static_preview: string;
  suspended: boolean;
}

export interface ExtAPI extends Base, Meta {
  ext_endpoint_type: 'persons';
  headers: Record<string, string>;
  name: string;
  organization_uuid: Base['uuid'];
  payload: Record<string, string>;
  url: string;
}

export interface IdProviderInfo extends Base {
  attributes?: string[] | null;
  first_name: string;
  id_provider_uuid: Base['uuid'];
  identifier_uuid: Base['uuid'];
  language: string;
  last_name: string;
  source: string;
}

export interface IdType extends Base, Meta {
  country: string;
  description: string;
  name: string;
  type: string;
  verify_interval: number;
}

export interface Identifier extends Base, Meta {
  deleted: boolean;
  group_id?: string | null;
  id: string;
  'id_provider_infos.uuid': Base['uuid'][];
  id_type_uuid: Base['uuid'];
  'organization_identifiers.uuid': Base['uuid'][];
  verified?: boolean | null;
}

export interface IdProvider extends Base {
  deleted: boolean;
  type: string;
  name: string;
  description: string;
  id: string;
  url_group_id: number;
  translation_id: number;
}

export interface Metadata extends Base {
  deleted: boolean;
  json_data: Record<string, unknown>;
  model: string;
  model_uuid: Base['uuid'];
  name: string;
  subtype1: string | null;
  subtype2: string | null;
  type: string;
}

export interface Organization extends Base, Meta {
  country: string;
  default_language: string;
  deleted: boolean;
  description: string;
  group_id?: number | null;
  legal_entity_type: string;
  name: string;
}

export interface OrganizationId extends Base {
  organization_uuid: Base['uuid'];
}

export interface OrganizationIdentifier extends Base {
  identifier_uuid: Base['uuid'];
  organization_uuid: Base['uuid'];
  role: OrganizationIdentifierRole;
}

export interface ProcessingRecord extends Base, Meta {
  data_consumer_uuid: Base['uuid'];
  data_provider_uuid: Base['uuid'];
  expires: string | null;
  group_id?: number | null;
  not_valid_before: null;
  'processing_record_participants.uuid': string[];
  record_type: RecordType;
  status: RecordStatus;
  reference: string;
  terminal_state_activated: string | null;
  terminal_status: TerminalStatus;
}

export interface ProcessingRecordHistoryItem extends Base {
  client_id_uuid: Base['uuid'];
  domain: string;
  identifier_uuid: Base['uuid'];
  migration_version: string;
  new_prp_accepted_language: string;
  new_pr_derived_status: string;
  new_prp_status: string;
  old_prp_accepted_language: string;
  old_pr_derived_status: string;
  old_prp_status: string;
  organization_uuid: Base['uuid'];
  processing_record_participant_uuid: Base['uuid'];
  processing_record_uuid: Base['uuid'];
  request_id: string;
}

export interface ProcessingRecordParticipant extends Base, Meta {
  accepted_language: string | null;
  identifier_display_name: string | null;
  identifier_uuid: Base['uuid'];
  notification_email_address: string | null;
  processing_record_uuid: Base['uuid'];
  role: ParticipantRole;
  status: ParticipantStatus;
}
