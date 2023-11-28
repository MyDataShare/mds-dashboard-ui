import { fetchAllPages } from 'mydatashare-core';

import { Method } from 'types/enums';
import { MDS_API_URL } from 'util/constants';
import { getUserFromStorage } from 'util/storage';

interface RequestOptions {
  method?: Method;
  params?: Record<string, string>;
  payload?: object;
  headers?: Record<string, string>;
  config?: Record<string, unknown>;
  baseUrl?: string;
  fullUrl?: string;
  offset?: number | string;
  isPaginated?: boolean;
  fetchAll?: boolean;
  endpointIsFullURL?: boolean;
  addQueryParams?: boolean;
  returnStatus?: boolean;
}

const client = async (
  endpoint: string,
  {
    method = Method.GET,
    payload,
    headers,
    config,
    endpointIsFullURL,
    fetchAll,
    offset = 0,
    isPaginated = false,
    addQueryParams = true,
    returnStatus = false,
  }: RequestOptions = {}
) => {
  const user = getUserFromStorage();

  const autoHeaders: {
    Authorization?: string;
    'Content-Type'?: string;
    body?: string;
  } = {};
  if (user.token) {
    autoHeaders.Authorization = `Bearer ${user.token}`;
  }
  if (payload) {
    autoHeaders['Content-Type'] = 'application/json';
  }

  const fetchConfig: { method: Method; body?: string; headers: HeadersInit } = {
    method,
    headers: { ...headers, ...autoHeaders },
    ...config,
  };
  if (payload) {
    fetchConfig.body = JSON.stringify(payload);
  }
  let url = endpointIsFullURL ? endpoint : `${MDS_API_URL}/${endpoint}`;
  let params = {};
  if (isPaginated && !fetchAll) {
    params = { offset: offset.toString(), order_by: 'created_desc' };
  }
  if (addQueryParams) {
    if (!user?.identifierUuid || !user?.organization?.uuid) {
      // eslint-disable-next-line no-console
      console.error('Request requires authentication');
      throw new Error('errorGeneric');
    }
    params = {
      identifier_uuid: user.identifierUuid,
      organization_uuid: user.organization.uuid,
      ...params,
    };
  }
  if (Object.keys(params).length) {
    url += `?${new URLSearchParams(params)}`;
  }
  let res;
  if (fetchAll) {
    try {
      res = fetchAllPages(url, { options: fetchConfig });
    } catch (e) {
      return Promise.reject(new Error('Fetch failed.'));
    }
  } else {
    res = await fetch(url, fetchConfig);
  }
  if (res.status === 401) {
    window.location.assign(window.location.toString());
    return Promise.reject(new Error('Authentication is needed'));
  }
  if (fetchAll) {
    return res;
  }
  const resData = await res.json();
  if (res.ok) {
    if (returnStatus) return { status: res.status, data: resData };
    return resData;
  }
  return Promise.reject(new Error('Fetch failed.'));
};

export default client;
