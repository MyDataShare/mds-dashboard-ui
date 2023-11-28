import { useQuery } from '@tanstack/react-query';
import { getUrlMetadata } from 'mydatashare-core';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { fetchAccessGateway } from 'api/get';
import Breadcrumbs from 'components/breadcrumbs';
import Button from 'components/button';
import InlineHeadingWrapper from 'components/inline-heading-wrapper';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import { useAuth } from 'context/auth';
import { useTitle } from 'hooks';
import { Model } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getApiObject } from 'util/mds-api';

const AccessGateway = ({ match }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  useTitle('pageTitleAccessGateway', t);
  const { uuid } = match.params;
  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey: ['accessGateway', { uuid }],
    queryFn: fetchAccessGateway,
  });

  if (isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1>{t('headingAccessGateway')}</h1>
        <Loading />
      </>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const agw = getApiObject(data.access_gateways);
  let agwUrls;
  if (data.metadatas) {
    agwUrls = Object.values(getUrlMetadata(data.metadatas, agw)).filter(
      (meta) => meta.subtype1 === Model.ACCESS_GATEWAY
    );
  }
  // TODO: URLs list a11y – make url fields related to each other (list or something)
  return (
    <>
      <Breadcrumbs />
      <InlineHeadingWrapper>
        <h1 id="heading-agw-name">{agw.name}</h1>
        {user.organization.uuid === agw.organization_uuid && (
          <Button
            id="btn-edit-agw"
            variant="secondary"
            text={t('labelEdit')}
            to={`${match.url}/edit`}
            size="small"
          />
        )}
      </InlineHeadingWrapper>
      <LabeledValue markdown label={t('name')} value={agw.name} />
      <LabeledValue markdown label={t('description')} value={agw.description} />
      <h2>{t('headingAgwUrls')}</h2>
      {agwUrls &&
        agwUrls.map((url, index) => (
          <div key={url.uuid}>
            <LabeledValue
              idPostfix={index.toString()}
              label={t('name')}
              value={url.name}
            />
            <LabeledValue
              idPostfix={index.toString()}
              label={t('url')}
              value={url.json_data.url}
            />
            <LabeledValue
              idPostfix={index.toString()}
              label={t('method_type')}
              value={url.json_data.method_type.toUpperCase()}
            />
          </div>
        ))}
      {agwUrls.length === 0 && (
        <p>
          <i>{t('textNoUrls')}</i>
        </p>
      )}
      <h2>{t('headingOtherInformation')}</h2>
      <LabeledValue label={t('uuid')} value={agw.uuid} />
      <LabeledValue label={t('created')} value={formatDate(agw.created)} />
      <LabeledValue label={t('updated')} value={formatDate(agw.updated)} />
    </>
  );
};

AccessGateway.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default AccessGateway;
