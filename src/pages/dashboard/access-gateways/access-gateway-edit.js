import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import AccessGatewayForm from './access-gateway-form';
import { fetchAccessGateway } from 'api/get';
import { patchAccessGateway } from 'api/modify';
import Breadcrumbs from 'components/breadcrumbs';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import { useAuth } from 'context/auth';
import { useTitle, useTranslationMetadata, useUrlMetadata } from 'hooks';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getApiObject } from 'util/mds-api';

const AccessGatewayEdit = ({ match }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { user } = useAuth();
  useTitle('pageTitleAccessGatewayEdit', t);
  const { uuid } = match.params;
  const queryKey = ['accessGateway', { uuid }];
  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey,
    queryFn: fetchAccessGateway,
  });
  const agw = getApiObject(data?.access_gateways);
  const translationMeta = useTranslationMetadata(data, agw);
  const urlMeta = useUrlMetadata(data, agw);

  if (isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1 id="heading-edit-agw">{t('headingAccessGatewayEdit')}</h1>
        <Loading />
      </>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  if (agw.organization_uuid !== user.organization.uuid) {
    throw new Error('errorNoPermission');
  }

  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-edit-agw">{t('headingAccessGatewayEdit')}</h1>
      <LabeledValue label={t('uuid')} value={agw.uuid} />
      <LabeledValue label={t('created')} value={formatDate(agw.created)} />
      <LabeledValue label={t('updated')} value={formatDate(agw.updated)} />
      <AccessGatewayForm
        accessGateway={agw}
        translationMetadatas={translationMeta}
        urlMetadatas={urlMeta}
        mutationFn={patchAccessGateway}
        invalidateQueries={[queryKey, 'accessGateways']}
        onSuccess={() => history.replace('.')}
        onDeleteSuccess={() => history.replace('/accessGateways')}
      />
    </>
  );
};

AccessGatewayEdit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default AccessGatewayEdit;
