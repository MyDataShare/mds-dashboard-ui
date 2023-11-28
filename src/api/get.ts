import { QueryKeyGet } from 'types';
import {
  DataConsumersResponse,
  DataProvidersResponse,
} from 'types/api-responses';
import client from 'util/client';
import {
  ENDPOINT_ACCESS_GATEWAY,
  ENDPOINT_DATA_CONSUMER,
  ENDPOINT_DATA_PROVIDER,
  ENDPOINT_PROCESSING_RECORD,
} from 'util/constants';

// TODO: MDP2-1537 MDS API fetches, result validations, constants etc should be moved to MDS Core JS

export const fetchAccessGateway = async ({ queryKey }: QueryKeyGet) =>
  client(`${ENDPOINT_ACCESS_GATEWAY}/${queryKey[1].uuid}`);

export const fetchDataConsumer = async ({
  queryKey,
}: QueryKeyGet): Promise<DataConsumersResponse> =>
  client(`${ENDPOINT_DATA_CONSUMER}/${queryKey[1].uuid}`);
export const fetchDataProvider = async ({
  queryKey,
}: QueryKeyGet): Promise<DataProvidersResponse> =>
  client(`${ENDPOINT_DATA_PROVIDER}/${queryKey[1].uuid}`);
export const fetchProcessingRecord = async ({ queryKey }: QueryKeyGet) =>
  client(`${ENDPOINT_PROCESSING_RECORD}/${queryKey[1].uuid}`);
