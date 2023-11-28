import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/button';
import TabPanel from 'components/tab-panel';
import { useAuth } from 'context/auth';
import { useTitle } from 'hooks';
import AccessGateways from 'pages/dashboard/access-gateways';
import DataConsumers from 'pages/dashboard/data-consumers';
import DataProviders from 'pages/dashboard/data-providers';
import Users from 'pages/dashboard/users';
import { OrganizationIdentifierRole } from 'types/enums';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  useTitle(null, t);
  const tabLinks = [
    {
      to: '/dataConsumers',
      title: t('tabTitleDataConsumers'),
      id: 'dc',
      component: <DataConsumers />,
    },
    {
      to: '/dataProviders',
      title: t('tabTitleDataProviders'),
      id: 'dp',
      component: <DataProviders />,
    },
    {
      to: '/accessGateways',
      title: t('tabTitleAccessGateways'),
      id: 'agw',
      component: <AccessGateways />,
    },
  ];
  if (user.organizationIdentifier.role === OrganizationIdentifierRole.ADMIN) {
    tabLinks.push({
      to: '/users',
      title: t('tabTitleUsers'),
      id: 'users',
      component: <Users />,
    });
  }
  return (
    <>
      <h1 id="heading-dashboard">{t('headingDashboard')}</h1>
      <TabPanel links={tabLinks} />
      <h1 id="heading-request-support">{t('headingRequestSupport')}</h1>
      <h2 id="heading-request-org">{t('headingRequestOrganization')}</h2>
      <p>{t('textRequestOrganization')}</p>
      <Button
        id="btn-request-org"
        text={t('labelRequestOrganization')}
        variant="secondary"
        to="/organizationRequest"
        size="small"
      />
      <h2 id="heading-request-client">{t('headingRequestClient')}</h2>
      <p>{t('textRequestClient')}</p>
      <Button
        id="btn-request-client"
        text={t('labelRequestClient')}
        variant="secondary"
        to="/clientRequest"
        size="small"
      />
    </>
  );
};

export default Dashboard;
