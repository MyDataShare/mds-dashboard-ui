import { buildMetadataRequests, IFormData } from './index';
import {
  AccessGateway,
  DataConsumer,
  DataProvider,
  Metadata,
  ProcessingRecord,
  ProcessingRecordParticipant,
} from 'types/api-objects';
import { Method, Model } from 'types/enums';
import client from 'util/client';
import {
  ENDPOINT_ACCESS_GATEWAY,
  ENDPOINT_DATA_CONSUMER,
  ENDPOINT_DATA_PROVIDER,
  ENDPOINT_METADATA,
  ENDPOINT_PROCESSING_RECORD,
  ENDPOINT_PROCESSING_RECORD_PARTICIPANT,
} from 'util/constants';

// TODO: MDP2-1537 MDS API fetches, result validations, constants etc should be moved to MDS Core JS

interface AccessGatewayPatchPayload {
  accessGateway: AccessGateway;
  metadatas: Record<string, Metadata>;
  payload: IFormData & { accessGateway: object }; // TODO
}

export const patchAccessGateway = async ({
  accessGateway,
  metadatas,
  payload,
}: AccessGatewayPatchPayload) => {
  const ret = await client(`${ENDPOINT_ACCESS_GATEWAY}/${accessGateway.uuid}`, {
    method: Method.PATCH,
    payload: { ...payload.accessGateway },
  });
  await Promise.all(
    buildMetadataRequests({
      objName: Model.ACCESS_GATEWAY,
      obj: accessGateway,
      metadatas,
      formData: payload,
    })
  );
  return ret;
};

interface DataConsumerPatchPayload {
  dataConsumer: DataConsumer;
  metadatas: Record<string, Metadata>;
  payload: IFormData & { dataConsumer: object }; // TODO
}

export const patchDataConsumer = async ({
  dataConsumer,
  metadatas,
  payload,
}: DataConsumerPatchPayload) => {
  const ret = await client(`${ENDPOINT_DATA_CONSUMER}/${dataConsumer.uuid}`, {
    method: Method.PATCH,
    payload: { ...payload.dataConsumer },
  });
  await Promise.all(
    buildMetadataRequests({
      objName: Model.DATA_CONSUMER,
      obj: dataConsumer,
      metadatas,
      formData: payload,
    })
  );
  return ret;
};

interface DataProviderPatchPayload {
  dataProvider: DataProvider;
  metadatas: Record<string, Metadata>;
  payload: IFormData & { dataProvider: object }; // TODO
}

export const patchDataProvider = async ({
  dataProvider,
  metadatas,
  payload,
}: DataProviderPatchPayload) => {
  const ret = await client(`${ENDPOINT_DATA_PROVIDER}/${dataProvider.uuid}`, {
    method: Method.PATCH,
    payload: { ...payload.dataProvider },
  });
  await Promise.all(
    buildMetadataRequests({
      objName: Model.DATA_PROVIDER,
      obj: dataProvider,
      metadatas,
      formData: payload,
    })
  );
  return ret;
};

interface MetadataPatchPayload {
  metadata: Metadata;
  payload: IFormData & { metadata: object }; // TODO
}

export const patchMetadata = async ({
  metadata,
  payload,
}: MetadataPatchPayload) =>
  client(`${ENDPOINT_METADATA}/${metadata.uuid}`, {
    method: Method.PATCH,
    payload: { ...payload.metadata },
  });

interface ProcessingRecordPatchPayload {
  processingRecord: ProcessingRecord;
  payload: IFormData & { processingRecord: object }; // TODO
}

export const patchProcessingRecord = async ({
  processingRecord,
  payload,
}: ProcessingRecordPatchPayload) => {
  const uuids = Array.isArray(processingRecord)
    ? processingRecord.map((pr) => pr.uuid)
    : [processingRecord.uuid];
  return client(`${ENDPOINT_PROCESSING_RECORD}/${uuids.join()}`, {
    method: Method.PATCH,
    payload: { ...payload.processingRecord },
  });
};

interface ProcessingRecordParticipantPatchPayload {
  processingRecordParticipant: ProcessingRecordParticipant;
  payload: IFormData & { processingRecordParticipant: object }; // TODO
}

export const patchProcessingRecordParticipant = async ({
  processingRecordParticipant,
  payload,
}: ProcessingRecordParticipantPatchPayload) =>
  client(
    `${ENDPOINT_PROCESSING_RECORD_PARTICIPANT}/${processingRecordParticipant.uuid}`,
    {
      method: Method.PATCH,
      payload: { ...payload.processingRecordParticipant },
    }
  );
