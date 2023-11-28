import {
  AccessGateway,
  AccessItem,
  AuthItem,
  DataConsumer,
  DataProvider,
  ExtAPI,
  Identifier,
  IdProvider,
  IdProviderInfo,
  IdType,
  Metadata,
  Organization,
  OrganizationId,
  OrganizationIdentifier,
  ProcessingRecord,
  ProcessingRecordHistoryItem,
  ProcessingRecordParticipant,
} from 'types/api-objects';

export interface AccessGatewayResponse {
  access_gateways: Record<string, AccessGateway>;
  organizations: Record<string, Organization>;
}

export interface AccessItemsResponse {
  access_items: Record<string, AccessItem>;
  limit: number;
  status: number;
}

export interface AuthItemsResponse {
  auth_items: Record<string, AuthItem>;
  id_providers: Record<string, IdProvider>;
  metadatas: Record<string, Metadata>;
}

export interface DataConsumersResponse {
  data_consumers: Record<string, DataConsumer>;
  organizations: Record<string, Organization>;
  data_providers?: Record<string, DataProvider>;
  ext_apis?: Record<string, ExtAPI>;
  metadatas?: Record<string, Metadata>;
}

export interface DataProvidersResponse {
  data_providers: Record<string, DataProvider>;
  organizations: Record<string, Organization>;
  metadatas: Record<string, Metadata>;
}

export interface IdentifiersResponse {
  id_provider_infos: Record<string, IdProviderInfo>;
  id_types: Record<string, IdType>;
  identifiers: Record<string, Identifier>;
  metadatas: Record<string, Metadata>;
  organizations: Record<string, Organization>;
  organization_identifiers: Record<string, OrganizationIdentifier>;
}

export interface OrganizationIdentifiersResponse {
  identifiers: Record<string, Identifier>;
  organizations: Record<string, Organization>;
  organization_identifiers: Record<string, OrganizationIdentifier>;
}

export interface OrganizationIdsResponse {
  organizations: Record<string, Organization>;
  organization_ids: Record<string, OrganizationId>;
}

export interface ProcessingRecordsResponse {
  data_consumers: Record<string, DataConsumer>;
  data_providers: Record<string, DataProvider>;
  identifiers: Record<string, Identifier>;
  id_types: Record<string, IdType>;
  metadatas: Record<string, Metadata>;
  organizations: Record<string, Organization>;
  processing_records: Record<string, ProcessingRecord>;
  processing_record_participants: Record<string, ProcessingRecordParticipant>;
}

export interface ProcessingRecordHistoryItemsResponse {
  processing_record_history_items: Record<string, ProcessingRecordHistoryItem>;
  identifiers: Record<string, Identifier>;
  limit: number;
  metadatas: Record<string, Metadata>;
  organizations: Record<string, Organization>;
  status: number;
}
