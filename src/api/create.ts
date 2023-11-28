import { buildMetadataRequests, IFormData } from './index';
import {
  AccessGatewayResponse,
  DataConsumersResponse,
  DataProvidersResponse,
} from 'types/api-responses';
import { Method, Model, RecordType } from 'types/enums';
import client from 'util/client';
import {
  ENDPOINT_ACCESS_GATEWAY,
  ENDPOINT_DATA_CONSUMER,
  ENDPOINT_DATA_PROVIDER,
  ENDPOINT_METADATA,
  ENDPOINT_ORGANIZATION_IDENTIFIER,
  ENDPOINT_PROCESSING_RECORD,
  ENDPOINT_SUPPORT_REQUEST,
} from 'util/constants';
import { getLoggedInUserFromStorage } from 'util/storage';

// TODO: MDP2-1537 MDS API fetches, result validations, constants etc should be moved to MDS Core JS

interface AccessGatewayPayload {
  payload: IFormData & {
    accessGateway: object; // TODO
  };
}

export const createAccessGateway = async ({
  payload,
}: AccessGatewayPayload) => {
  const user = getLoggedInUserFromStorage();
  const ret: AccessGatewayResponse = await client(ENDPOINT_ACCESS_GATEWAY, {
    method: Method.POST,
    payload: {
      ...payload.accessGateway,
      organization_uuid: user.organization.uuid,
    },
  });
  await Promise.all(
    buildMetadataRequests({
      objName: Model.ACCESS_GATEWAY,
      obj: Object.values(ret.access_gateways)[0],
      formData: payload,
    })
  );
  return ret;
};

interface DataConsumerPayload {
  payload: IFormData & {
    dataConsumer: object; // TODO
  };
}

export const createDataConsumer = async ({ payload }: DataConsumerPayload) => {
  const user = getLoggedInUserFromStorage();
  const ret: DataConsumersResponse = await client(ENDPOINT_DATA_CONSUMER, {
    method: Method.POST,
    payload: {
      ...payload.dataConsumer,
      organization_uuid: user.organization.uuid,
    },
  });
  await Promise.all(
    buildMetadataRequests({
      objName: Model.DATA_CONSUMER,
      obj: Object.values(ret.data_consumers)[0],
      formData: payload,
    })
  );
  return ret;
};

interface DataProviderPayload {
  payload: IFormData & {
    dataProvider: object; // TODO
  };
}

export const createDataProvider = async ({ payload }: DataProviderPayload) => {
  const user = getLoggedInUserFromStorage();
  const ret: DataProvidersResponse = await client(ENDPOINT_DATA_PROVIDER, {
    method: Method.POST,
    payload: {
      ...payload.dataProvider,
      organization_uuid: user.organization.uuid,
    },
  });
  await Promise.all(
    buildMetadataRequests({
      objName: Model.DATA_PROVIDER,
      obj: Object.values(ret.data_providers)[0],
      formData: payload,
    })
  );
  return ret;
};
interface MetadataPayload {
  payload: {
    metadata: object; // TODO
  };
}

export const createMetadata = async ({ payload }: MetadataPayload) =>
  client(ENDPOINT_METADATA, {
    method: Method.POST,
    payload: { ...payload.metadata },
  });

interface OrganizationIdentifierPayload {
  payload: {
    organizationIdentifier: object; // TODO
  };
}
export const createOrganizationIdentifier = async ({
  payload,
}: OrganizationIdentifierPayload) => {
  const user = getLoggedInUserFromStorage();
  return client(ENDPOINT_ORGANIZATION_IDENTIFIER, {
    method: Method.POST,
    payload: {
      ...payload.organizationIdentifier,
      organization_uuid: user.organization.uuid,
    },
  });
};

interface ProcessingRecordPayload {
  data_consumer_uuid: string;
  record_type: RecordType;
  data_provider_uuid?: string;
}

export const createProcessingRecord = async ({
  payload,
}: {
  payload: { processingRecord: ProcessingRecordPayload };
}) => {
  const { status, data } = await client(ENDPOINT_PROCESSING_RECORD, {
    method: Method.POST,
    payload: payload.processingRecord,
    returnStatus: true,
  });
  return { status, data };
};

interface ProcessingRecordBatchPayload {
  payload: {
    processingRecord: object; // TODO
  };
}

export const createProcessingRecordBatch = async ({
  payload,
}: ProcessingRecordBatchPayload) => {
  const { status, data } = await client(
    `${ENDPOINT_PROCESSING_RECORD}/batch_create`,
    {
      method: Method.POST,
      payload: payload.processingRecord,
      returnStatus: true,
    }
  );
  return { status, data };
};

interface SupportRequestPayload {
  payload: object; // TODO
}

export const createSupportRequest = async ({
  payload,
}: SupportRequestPayload) =>
  client(ENDPOINT_SUPPORT_REQUEST, {
    method: Method.POST,
    payload,
  });
