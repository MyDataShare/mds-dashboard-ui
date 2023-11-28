import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import DataConsumerForm from './data-consumer-form';
import { fetchDataConsumer } from 'api/get';
import { patchDataConsumer } from 'api/modify';
import Breadcrumbs from 'components/breadcrumbs';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import { useTitle, useTranslationMetadata } from 'hooks';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getApiObject } from 'util/mds-api';

const DataConsumerEdit = ({ match }) => {
  const history = useHistory();
  const { t } = useTranslation();
  useTitle('pageTitleDataConsumerEdit', t);
  const { uuid } = match.params;
  const queryKey = ['dataConsumer', { uuid }];
  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey,
    queryFn: fetchDataConsumer,
  });

  const dataConsumer = getApiObject(data?.data_consumers);
  const translationMeta = useTranslationMetadata(data, dataConsumer);
  if (isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1 id="heading-edit-dc">{t('headingDataConsumerEdit')}</h1>
        <Loading />
      </>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-edit-dc">{t('headingDataConsumerEdit')}</h1>
      <LabeledValue label={t('uuid')} value={dataConsumer.uuid} />
      <LabeledValue
        label={t('created')}
        value={formatDate(dataConsumer.created)}
      />
      <LabeledValue
        label={t('updated')}
        value={formatDate(dataConsumer.updated)}
      />
      <DataConsumerForm
        dataConsumer={dataConsumer}
        translationMetadatas={translationMeta}
        mutationFn={patchDataConsumer}
        invalidateQueries={[queryKey, 'dataConsumers']}
        onSuccess={() => history.replace('.')}
        onDeleteSuccess={() => history.replace('/dataConsumers')}
      />
    </>
  );
};

DataConsumerEdit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default DataConsumerEdit;
