import { QueryKeyGet } from 'types';
import { Metadata } from 'types/api-objects';
import { Method, Model } from 'types/enums';
import client from 'util/client';
import {
  ENDPOINT_EXTERNAL_API,
  ENDPOINT_METADATA,
  ENDPOINT_SEND_EMAIL,
} from 'util/constants';
import { getEndpointForModel } from 'util/mds-api';

// TODO: MDP2-1537 MDS API fetches, result validations, constants etc should be moved to MDS Core JS

// TODO: How to get status here and react to 403... returnStatus only works on OK requests
export const fetchExternalAPI = async ({
  queryKey,
  pageParam = 0,
}: QueryKeyGet & { pageParam?: number }) =>
  client(`${ENDPOINT_EXTERNAL_API}/${queryKey[1].uuid}`, {
    method: Method.POST,
    offset: pageParam,
    isPaginated: true,
  });

export const sendEmail = async (prUuid: string) =>
  client(`${ENDPOINT_SEND_EMAIL}/${prUuid}`, { method: Method.POST });

export interface IFormData {
  deleted: [Model, string][];
  translations: {
    language: string;
    values: Record<string, string>;
  }[];
  urls: {
    uuid?: string;
    name: string;
    url_type: string;
    subtype2: string;
    url: string;
    method_type: Method;
  }[];
}

type BuildMetadataRequestsArgs = {
  objName: Model;
  obj: {
    uuid: string;
    'metadatas.uuid': string[];
  };
  metadatas?: Record<string, Metadata>;
  formData: IFormData;
};

export const buildMetadataRequests = ({
  objName,
  obj,
  metadatas,
  formData,
}: BuildMetadataRequestsArgs) => {
  const requests: Promise<unknown>[] = [];
  const existingLanguages = metadatas
    ? Object.fromEntries(
        Object.values(metadatas)
          .filter(
            (meta) => meta.type === 'translation' && meta.model === objName
          )
          .map((meta) => [meta.subtype1, meta.uuid])
      )
    : {};
  if (formData.deleted && formData.deleted.length > 0) {
    formData.deleted.forEach(([model, uuid]) => {
      requests.push(
        client(`${getEndpointForModel(model)}/${uuid}`, {
          method: Method.DELETE,
        })
      );
    });
  }

  if (formData.translations) {
    formData.translations.forEach(({ language, values }) => {
      const metaPayload = {
        name: `Translations in ${language}`,
        type: 'translation',
        subtype1: language,
        json_data: values,
      };
      if (language in existingLanguages) {
        requests.push(
          client(`${ENDPOINT_METADATA}/${existingLanguages[language]}`, {
            method: Method.PATCH,
            payload: metaPayload,
          })
        );
      } else {
        requests.push(
          client(ENDPOINT_METADATA, {
            method: Method.POST,
            payload: {
              ...metaPayload,
              model: objName,
              model_uuid: obj.uuid,
            },
          })
        );
      }
    });
  }

  if (formData.urls) {
    formData.urls.forEach((urlData) => {
      if (urlData.uuid && obj['metadatas.uuid'].includes(urlData.uuid)) {
        requests.push(
          client(`${ENDPOINT_METADATA}/${urlData.uuid}`, {
            method: Method.PATCH,
            payload: {
              type: 'url',
              name: urlData.name,
              subtype1: urlData.url_type,
              subtype2: urlData.subtype2,
              json_data: {
                url: urlData.url,
                method_type: urlData.method_type,
                name: urlData.name,
              },
            },
          })
        );
      } else {
        requests.push(
          client(ENDPOINT_METADATA, {
            method: Method.POST,
            payload: {
              model: objName,
              model_uuid: obj.uuid,
              type: 'url',
              name: urlData.name,
              subtype1: urlData.url_type,
              subtype2: urlData.subtype2,
              json_data: {
                url: urlData.url,
                method_type: urlData.method_type,
                name: urlData.name,
              },
            },
          })
        );
      }
    });
  }
  return requests;
};

export const deleteModel = async ({
  model,
  uuid,
}: {
  model: Model;
  uuid: string;
}) => {
  const endpoint = getEndpointForModel(model);
  return client(`${endpoint}/${uuid}`, {
    method: Method.DELETE,
  });
};
