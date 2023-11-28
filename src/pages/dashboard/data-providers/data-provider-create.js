import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import DataProviderForm from './data-provider-form';
import { createDataProvider } from 'api/create';
import Breadcrumbs from 'components/breadcrumbs';
import { useTitle } from 'hooks';

const DataProviderCreate = () => {
  const { t } = useTranslation();
  const history = useHistory();
  useTitle('pageTitleDataProviderCreate', t);
  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-create-dp">{t('headingDataProviderCreate')}</h1>
      <DataProviderForm
        mutationFn={createDataProvider}
        invalidateQueries={['accessGateways']}
        onSuccess={(data) => {
          if (
            data.data_providers &&
            Object.keys(data.data_providers).length > 0
          ) {
            history.replace(`./${Object.keys(data.data_providers)[0]}`);
          } else {
            history.replace('.');
          }
        }}
      />
    </>
  );
};

export default DataProviderCreate;
