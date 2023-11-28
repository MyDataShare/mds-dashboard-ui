import { fetchAuthItems as coreFetchAuthItems } from 'mydatashare-core';

import { APISearchParams } from 'types';
import { OrganizationIdentifier } from 'types/api-objects';
import {
  OrganizationIdentifiersResponse,
  OrganizationIdsResponse,
} from 'types/api-responses';
import { Method } from 'types/enums';
import client from 'util/client';
import {
  ENDPOINT_ACCESS_GATEWAYS,
  ENDPOINT_DATA_CONSUMERS,
  ENDPOINT_DATA_PROVIDERS,
  ENDPOINT_EXT_APIS,
  ENDPOINT_ORGANIZATION_IDENTIFIERS,
  ENDPOINT_ORGANIZATION_IDS,
  ENDPOINT_PROCESSING_RECORDS,
} from 'util/constants';
import { getLoggedInUserFromStorage } from 'util/storage';

// TODO: MDP2-1537 MDS API fetches, result validations, constants etc should be moved to MDS Core JS

export const fetchAccessGateways = async ({
  queryKey: [, payload, offset],
  pageParam = 0,
}: APISearchParams) => {
  const user = getLoggedInUserFromStorage();
  const usedOffset = offset || pageParam;
  return client(ENDPOINT_ACCESS_GATEWAYS, {
    method: Method.POST,
    isPaginated: true,
    payload: { ...payload, organization_uuid: user.organization.uuid },
    offset: usedOffset,
  });
};

export const fetchAuthItems = async () => coreFetchAuthItems();

interface DataConsumerSearchPayload {
  asd: object; // TODO
}

export const fetchDataConsumers = async ({
  queryKey: [, payload, offset],
}: {
  queryKey: [_: string, payload: DataConsumerSearchPayload, offset: number];
}) =>
  client(ENDPOINT_DATA_CONSUMERS, {
    method: Method.POST,
    isPaginated: true,
    payload,
    offset,
  });

interface DataProviderSearchPayload {
  asd: object; // TODO
}

export const fetchDataProviders = async ({
  queryKey: [, payload, offset],
}: {
  queryKey: [_: string, payload: DataProviderSearchPayload, offset: number];
}) => {
  const user = getLoggedInUserFromStorage();
  return client(ENDPOINT_DATA_PROVIDERS, {
    method: Method.POST,
    payload: { ...payload, organization_uuid: user.organization.uuid },
    offset,
    isPaginated: true,
  });
};

interface ExtAPISearchPayload {
  asd: object; // TODO
}

export const fetchExtAPIs = async ({
  queryKey: [, payload, offset],
  pageParam = 0,
}: {
  queryKey: [_: string, payload: ExtAPISearchPayload, offset: number];
  pageParam: number;
}) => {
  const user = getLoggedInUserFromStorage();
  const usedOffset = offset || pageParam;
  return client(ENDPOINT_EXT_APIS, {
    method: Method.POST,
    isPaginated: true,
    payload: { ...payload, organization_uuid: user.organization.uuid },
    offset: usedOffset,
  });
};

export const fetchOrganizationIds = async ({
  pageParam = 0,
}: {
  pageParam: number;
}): Promise<OrganizationIdsResponse> =>
  client(ENDPOINT_ORGANIZATION_IDS, {
    method: Method.POST,
    offset: pageParam,
    isPaginated: true,
  });

interface OrganizationIdentifierSearchPayload {
  asd: object; // TODO
}

export const fetchOrganizationIdentifiers = async ({
  queryKey: [, payload, offset],
}: {
  queryKey: [
    _: string,
    payload: OrganizationIdentifierSearchPayload,
    offset: number,
  ];
}) => {
  const user = getLoggedInUserFromStorage();
  const ret: OrganizationIdentifiersResponse = await client(
    ENDPOINT_ORGANIZATION_IDENTIFIERS,
    {
      method: Method.POST,
      payload: { ...payload, organization_uuid: user.organization.uuid },
      offset,
      isPaginated: true,
    }
  );
  if ('organization_identifiers' in ret) {
    const filtered: Record<string, OrganizationIdentifier> = {};
    Object.values(ret.organization_identifiers).forEach((orgIdent) => {
      if (orgIdent.organization_uuid === user.organization.uuid) {
        filtered[orgIdent.uuid] = orgIdent;
      }
    });
    ret.organization_identifiers = filtered;
  }
  return ret;
};

export interface ProcessingRecordSearchPayload {
  data_consumer_uuid?: string;
  data_provider_uuid?: string;
  record_type?: string;
  reference?: string;
}

export const fetchProcessingRecords = async ({
  queryKey: [, payload, offset],
  pageParam = 0,
}: {
  queryKey: [
    _: string,
    payload: ProcessingRecordSearchPayload,
    offset?: number,
  ];
  pageParam?: number;
}) => {
  const usedOffset = offset || pageParam;
  return client(ENDPOINT_PROCESSING_RECORDS, {
    method: Method.POST,
    payload,
    offset: usedOffset,
    isPaginated: true,
  });
};
