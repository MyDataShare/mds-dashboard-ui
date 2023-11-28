import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import AccessGatewayForm from './access-gateway-form';
import { createAccessGateway } from 'api/create';
import Breadcrumbs from 'components/breadcrumbs';
import { useTitle } from 'hooks';

const AccessGatewayCreate = () => {
  const { t } = useTranslation();
  const history = useHistory();
  useTitle('pageTitleAccessGatewayCreate', t);

  return (
    <>
      <Breadcrumbs />
      <h1>{t('headingAccessGatewayCreate')}</h1>
      <AccessGatewayForm
        mutationFn={createAccessGateway}
        invalidateQueries={['dataProviders']}
        onSuccess={(data) => {
          if (
            data.access_gateways &&
            Object.keys(data.access_gateways).length > 0
          ) {
            history.replace(`./${Object.keys(data.access_gateways)[0]}`);
          } else {
            history.replace('.');
          }
        }}
      />
    </>
  );
};

export default AccessGatewayCreate;
