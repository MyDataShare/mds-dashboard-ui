import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import { useAuth } from 'context/auth';
import { BreadcrumbsContext } from 'context/breadcrumbs';
import Dashboard from 'pages/dashboard';
import AccessGateway from 'pages/dashboard/access-gateways/access-gateway';
import AccessGatewayCreate from 'pages/dashboard/access-gateways/access-gateway-create';
import AccessGatewayEdit from 'pages/dashboard/access-gateways/access-gateway-edit';
import ClientRequest from 'pages/dashboard/client-request';
import DataConsumer from 'pages/dashboard/data-consumers/data-consumer';
import DataConsumerCreate from 'pages/dashboard/data-consumers/data-consumer-create';
import DataConsumerEdit from 'pages/dashboard/data-consumers/data-consumer-edit';
import DataProvider from 'pages/dashboard/data-providers/data-provider';
import DataProviderCreate from 'pages/dashboard/data-providers/data-provider-create';
import DataProviderEdit from 'pages/dashboard/data-providers/data-provider-edit';
import Members from 'pages/dashboard/members';
import OrganizationRequest from 'pages/dashboard/organization-request';
import ProcessingRecords from 'pages/dashboard/processing-records';
import ProcessingRecord from 'pages/dashboard/processing-records/processing-record';
import ProcessingRecordCreate from 'pages/dashboard/processing-records/processing-record-create';
import ProcessingRecordEdit from 'pages/dashboard/processing-records/processing-record-edit';
import UserCreate from 'pages/dashboard/users/user-create';
import PageNotFound from 'pages/page-not-found';
import { OrganizationIdentifierRole } from 'types/enums';

const routes = [
  {
    path: '/',
    name: 'appTitleShort',
    exact: true,
    children: <Redirect to="/dataConsumers" />,
  },

  {
    path: '/accessGateways',
    exact: true,
    name: 'tabTitleAccessGateways',
    Component: Dashboard,
  },
  {
    path: '/accessGateways/create',
    exact: true,
    name: 'pageTitleAccessGatewayCreate',
    Component: AccessGatewayCreate,
  },
  {
    path: '/accessGateways/:uuid',
    exact: true,
    name: 'pageTitleAccessGateway',
    Component: AccessGateway,
  },
  {
    path: '/accessGateways/:uuid/edit',
    exact: true,
    name: 'pageTitleAccessGatewayEdit',
    Component: AccessGatewayEdit,
  },

  {
    path: '/dataConsumers',
    exact: true,
    name: 'tabTitleDataConsumers',
    Component: Dashboard,
  },
  {
    path: '/dataConsumers/create',
    exact: true,
    name: 'pageTitleDataConsumerCreate',
    Component: DataConsumerCreate,
  },
  {
    path: '/dataConsumers/:uuid',
    exact: true,
    name: 'pageTitleDataConsumer',
    Component: DataConsumer,
  },
  {
    path: '/dataConsumers/:uuid/edit',
    exact: true,
    name: 'pageTitleDataConsumerEdit',
    Component: DataConsumerEdit,
  },
  {
    path: '/dataConsumers/:uuid/members',
    exact: true,
    name: 'pageTitleMembers',
    Component: Members,
  },
  {
    path: '/dataConsumers/:uuid/members/:uuid',
    exact: true,
    name: 'pageTitleProcessingRecord',
    Component: ProcessingRecord,
  },
  {
    path: '/dataConsumers/:uuid/members/:uuid/edit',
    exact: true,
    name: 'pageTitleProcessingRecordEdit',
    Component: ProcessingRecordEdit,
  },
  {
    path: '/dataConsumers/:uuid/processingRecords',
    exact: true,
    name: 'pageTitleProcessingRecords',
    Component: ProcessingRecords,
  },
  {
    path: '/dataConsumers/:uuid/processingRecords/create',
    exact: true,
    name: 'pageTitleProcessingRecordCreate',
    Component: ProcessingRecordCreate,
  },
  {
    path: '/dataConsumers/:uuid/processingRecords/:uuid',
    exact: true,
    name: 'pageTitleProcessingRecord',
    Component: ProcessingRecord,
  },
  {
    path: '/dataConsumers/:uuid/processingRecords/:uuid/edit',
    exact: true,
    name: 'pageTitleProcessingRecordEdit',
    Component: ProcessingRecordEdit,
  },

  {
    path: '/dataProviders',
    exact: true,
    name: 'tabTitleDataProviders',
    Component: Dashboard,
  },
  {
    path: '/dataProviders/create',
    exact: true,
    name: 'pageTitleDataProviderCreate',
    Component: DataProviderCreate,
  },
  {
    path: '/dataProviders/:uuid',
    exact: true,
    name: 'pageTitleDataProvider',
    Component: DataProvider,
  },
  {
    path: '/dataProviders/:uuid/edit',
    exact: true,
    name: 'pageTitleDataProviderEdit',
    Component: DataProviderEdit,
  },
  {
    path: '/dataProviders/:uuid/processingRecords',
    exact: true,
    name: 'pageTitleProcessingRecords',
    Component: ProcessingRecords,
  },
  {
    path: '/dataProviders/:uuid/processingRecords/:uuid',
    exact: true,
    name: 'pageTitleProcessingRecord',
    Component: ProcessingRecord,
  },

  {
    path: '/users',
    exact: true,
    name: 'tabTitleUsers',
    Component: Dashboard,
    adminRestricted: true,
  },
  {
    path: '/users/add',
    exact: true,
    name: 'pageTitleUserCreate',
    Component: UserCreate,
    adminRestricted: true,
  },

  {
    path: '/clientRequest',
    exact: true,
    name: 'pageTitleClientRequest',
    Component: ClientRequest,
  },

  {
    path: '/organizationRequest',
    exact: true,
    name: 'pageTitleOrganizationRequest',
    Component: OrganizationRequest,
  },

  {
    Component: PageNotFound,
    key: 'notFound',
  },
];

const AuthenticatedApp = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const userRole = user.organizationIdentifier
    ? user.organizationIdentifier.role
    : OrganizationIdentifierRole.USER;
  return (
    <Switch>
      <Redirect from="/:url*(/+)" to={pathname.slice(0, -1)} />
      {routes.map(
        ({ path, exact, Component, children, key, adminRestricted }) => {
          if (adminRestricted && userRole !== OrganizationIdentifierRole.ADMIN)
            return null;
          return (
            <Route
              path={path}
              exact={exact}
              key={path || key}
              render={(props) => {
                // eslint-disable-next-line react/prop-types
                const breadcrumbs = getBreadcrumbs(props.match, t);
                return (
                  <BreadcrumbsContext.Provider value={breadcrumbs}>
                    {children || <Component {...props} />}
                  </BreadcrumbsContext.Provider>
                );
              }}
            />
          );
        }
      )}
    </Switch>
  );
};

export default AuthenticatedApp;

/* Helpers */

const getBreadcrumbs = (routeMatch, t) => {
  // eslint-disable-next-line react/prop-types
  const pathParts = routeMatch.path.split('/');
  // eslint-disable-next-line react/prop-types
  const urlParts = routeMatch.url.split('/');
  const pathMatches = [];
  for (let i = pathParts.length - 1; i >= 0; i -= 1) {
    const subPathToMatch = pathParts.slice(0, i + 1).join('/');
    const subUrl = urlParts.slice(0, i + 1).join('/');
    let matchedSubPath = routes.find(
      ({ path: _path }) => _path === subPathToMatch
    );
    if (matchedSubPath) {
      matchedSubPath = { ...matchedSubPath, path: subUrl };
      pathMatches.push(matchedSubPath);
    }
  }
  return pathMatches
    .map(({ name, path: _path }) => ({ name: t(name), path: _path }))
    .reverse();
};
