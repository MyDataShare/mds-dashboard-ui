import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Layout from 'layout';
import React from 'react';

import OrganizationSelect from 'components/organization-select';
import ScrollToTop from 'components/scroll-to-top';
import { useAuth } from 'context/auth';

const AuthenticatedApp = React.lazy(() => import('./authenticated'));
const UnauthenticatedApp = React.lazy(() => import('./unauthenticated'));

const App = () => {
  const authCtx = useAuth(true);
  let AppComponent = <UnauthenticatedApp />;
  if (authCtx?.user?.organization) {
    AppComponent = <AuthenticatedApp />;
  } else if (authCtx?.user) {
    AppComponent = <OrganizationSelect />;
  }
  return (
    <Layout>
      <ScrollToTop />
      {AppComponent}
      <ReactQueryDevtools initialIsOpen={false} />
    </Layout>
  );
};

export default App;
