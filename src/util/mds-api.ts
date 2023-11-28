import { User } from 'types';
import {
  DataConsumer,
  Metadata,
  ProcessingRecord,
  ProcessingRecordParticipant,
} from 'types/api-objects';
import {
  AccessGatewayResponse,
  DataConsumersResponse,
  DataProvidersResponse,
  IdentifiersResponse,
  OrganizationIdentifiersResponse,
  ProcessingRecordsResponse,
} from 'types/api-responses';
import {
  ActivationMode,
  Model,
  ParticipantRole,
  RecordStatus,
  RecordType,
} from 'types/enums';
import {
  ENDPOINT_ACCESS_GATEWAY,
  ENDPOINT_DATA_CONSUMER,
  ENDPOINT_DATA_PROVIDER,
  ENDPOINT_METADATA,
  ENDPOINT_ORGANIZATION_IDENTIFIER,
} from 'util/constants';

export const getEndpointForModel = (modelName: Model) => {
  let endpoint = '';
  switch (modelName) {
    case Model.ACCESS_GATEWAY:
      endpoint = ENDPOINT_ACCESS_GATEWAY;
      break;
    case Model.DATA_CONSUMER:
      endpoint = ENDPOINT_DATA_CONSUMER;
      break;
    case Model.DATA_PROVIDER:
      endpoint = ENDPOINT_DATA_PROVIDER;
      break;
    case Model.METADATA:
      endpoint = ENDPOINT_METADATA;
      break;
    case Model.ORGANIZATION_IDENTIFIER:
      endpoint = ENDPOINT_ORGANIZATION_IDENTIFIER;
      break;
    default:
      break;
  }
  if (!endpoint.length) {
    throw new Error(`Unknown model: ${modelName}`);
  }
  return endpoint;
};

export const formatUsername = ({
  givenName,
  familyName,
}: {
  givenName: string;
  familyName: string;
}) => {
  let username = '';
  if (givenName) {
    username += givenName;
  }
  if (familyName) {
    if (username) username += ' ';
    username += familyName;
  }
  return username;
};

export const getUsername = (
  response: IdentifiersResponse,
  identifierUuid?: string
) => {
  const ret = { givenName: '', familyName: '' };
  if (
    response &&
    response.id_provider_infos &&
    Object.keys(response.id_provider_infos).length > 0
  ) {
    const idProviderInfo = Object.values(response.id_provider_infos).find(
      (info) => {
        if (identifierUuid) {
          return (
            info.identifier_uuid === identifierUuid &&
            (!!info.first_name || !!info.last_name)
          );
        }
        return !!info.first_name || !!info.last_name;
      }
    );
    if (idProviderInfo) {
      ret.givenName = idProviderInfo.first_name;
      ret.familyName = idProviderInfo.last_name;
    }
  }
  return ret;
};

export function getApiObject<T>(modelsByUuid?: Record<string, T>): T | null {
  if (modelsByUuid && Object.keys(modelsByUuid).length > 0) {
    return Object.values(modelsByUuid)[0];
  }
  // TODO: Should we raise if not found? See usages
  return null;
}

export const getAccessGateways = (response: AccessGatewayResponse) => {
  if (
    response?.access_gateways &&
    Object.keys(response.access_gateways).length > 0
  ) {
    return Object.values(response.access_gateways);
  }
  return [];
};

export const getDataConsumers = (
  response: DataConsumersResponse | ProcessingRecordsResponse
) => {
  if (
    response?.data_consumers &&
    Object.keys(response.data_consumers).length > 0
  ) {
    return Object.values(response.data_consumers);
  }
  return [];
};

export const getDataProviders = (
  response: DataProvidersResponse | ProcessingRecordsResponse
) => {
  if (
    response?.data_providers &&
    Object.keys(response.data_providers).length > 0
  ) {
    return Object.values(response.data_providers);
  }
  return [];
};

export const getLatestParticipantNotification = (
  processingRecordParticipant: ProcessingRecordParticipant,
  metadatas: Metadata[],
  statusFilter: string | null = null
) => {
  if (metadatas.length === 0) return { date: null, status: null };
  if (!('metadatas.uuid' in processingRecordParticipant)) {
    return { date: null, status: null };
  }
  const notificationHistory = metadatas.find(
    (m) =>
      processingRecordParticipant['metadatas.uuid'].includes(m.uuid) &&
      m.type === 'notification_history'
  );
  if (!notificationHistory || !Array.isArray(notificationHistory.json_data)) {
    return { date: null, status: null };
  }
  if (statusFilter === null) {
    return notificationHistory.json_data[
      notificationHistory.json_data.length - 1
    ];
  }
  for (let i = notificationHistory.json_data.length - 1; i >= 0; i -= 1) {
    if (notificationHistory.json_data[i].status === statusFilter) {
      return notificationHistory.json_data[i];
    }
  }
  return { date: null, status: null };
};

export const getMetadata = (
  obj: { 'metadatas.uuid': string[] },
  metadataType: string,
  metadatas: Record<string, Metadata>
) =>
  Object.values(metadatas).find(
    (meta) =>
      obj['metadatas.uuid'].includes(meta.uuid) && meta.type === metadataType
  );

export const getMetadatas = (response: {
  metadatas?: Record<string, Metadata>;
}) => {
  if (
    response &&
    response.metadatas &&
    Object.keys(response.metadatas).length > 0
  ) {
    return Object.values(response.metadatas);
  }
  return [];
};

export const getEmailGateway = (user: User) => {
  // Try to find an email gateway Metadata from either the currently selected organization
  // or any organization grouped to it that the user has admin affiliations to.
  // Email gateways are meant to be shared between Organizations in the same group.
  let ret: Metadata | undefined;
  Object.values(user.organizations)
    .filter((org) => org.group_id === user.organization.group_id)
    .some((org) => {
      const emailGatewayMeta = getMetadata(
        org,
        'email_gateway',
        user.metadatas
      );
      if (emailGatewayMeta) {
        ret = emailGatewayMeta;
      }
      return ret !== undefined;
    });
  return ret;
};

export const isNotifiable = (
  user: User,
  dc: DataConsumer,
  pr: ProcessingRecord,
  participants: ProcessingRecordParticipant[]
) => {
  if (
    pr.status !== RecordStatus.PENDING ||
    pr.record_type !== RecordType.CONSENT
  )
    return false;
  const emailGatewayMeta = getEmailGateway(user);
  if (!emailGatewayMeta) return false;

  // A PR is notifiable, if at least one activation-capable participant has email
  return !!participants.find(
    (prp) =>
      !!prp.notification_email_address &&
      (dc.activation_mode === ActivationMode.DATA_SUBJECT_ACTIVATES ||
        prp.role !== ParticipantRole.DATA_SUBJECT)
  );
};

export const getOrganizationIdentifiers = (
  response: OrganizationIdentifiersResponse
) => {
  if (
    response &&
    response.organization_identifiers &&
    Object.keys(response.organization_identifiers).length > 0
  ) {
    return Object.values(response.organization_identifiers);
  }
  return [];
};

export const getProcessingRecords = (response: ProcessingRecordsResponse) => {
  if (
    response &&
    response.processing_records &&
    Object.keys(response.processing_records).length > 0
  ) {
    return Object.values(response.processing_records);
  }
  return [];
};
