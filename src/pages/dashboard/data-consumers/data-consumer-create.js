import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import DataConsumerForm from './data-consumer-form';
import { createDataConsumer } from 'api/create';
import Breadcrumbs from 'components/breadcrumbs';
import { useTitle } from 'hooks';

const DataConsumerCreate = () => {
  const { t } = useTranslation();
  const history = useHistory();
  useTitle('pageTitleDataConsumerCreate', t);
  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-create-dc">{t('headingDataConsumerCreate')}</h1>
      <DataConsumerForm
        mutationFn={createDataConsumer}
        invalidateQueries={['dataConsumers']}
        onSuccess={(data) => {
          if (
            data.data_consumers &&
            Object.keys(data.data_consumers).length > 0
          ) {
            history.replace(`./${Object.keys(data.data_consumers)[0]}`);
          } else {
            history.replace('.');
          }
        }}
      />
    </>
  );
};

export default DataConsumerCreate;
