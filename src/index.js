import { QueryClientProvider } from '@tanstack/react-query';
import en from 'date-fns/locale/en-GB';
import fi from 'date-fns/locale/fi';
import sv from 'date-fns/locale/sv';
import 'flag-icons/css/flag-icons.min.css';
import 'i18n';
import { registerLocale as isoRegisterLocale } from 'i18n-iso-countries';
import countriesEn from 'i18n-iso-countries/langs/en.json';
import i18n from 'i18next';
import { configureMdsCore, LANGUAGES, store } from 'mydatashare-core';
import React from 'react';
import { OverlayProvider } from 'react-aria';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import 'react-virtualized/styles.css';
import { ThemeProvider } from 'styled-components';

import App from 'app';
import Loading from 'components/loading';
import TitleAnnouncer from 'components/title-announcer';
import { AuthProvider } from 'context/auth';
import ErrorBoundary from 'error-boundary';
import queryClient from 'query';
import reportWebVitals from 'reportWebVitals';
import theme from 'theme';
import GlobalStyle from 'theme/global-style';
import { MDS_API_URL } from 'util/constants';

isoRegisterLocale(countriesEn);

registerLocale('en', en);
registerLocale('fi', fi);
registerLocale('sv', sv);
setDefaultLocale('en');

configureMdsCore({
  apiVersion: 'v3.0',
  apiBaseUrl: MDS_API_URL,
  AuthItem: { backgroundFetchOidConfig: true },
});
store.setLanguage(i18n.language ? LANGUAGES[i18n.language.slice(0, 2)] : 'en');

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Router>
        <OverlayProvider style={{ height: '100%' }}>
          <ErrorBoundary logOutUser>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <ErrorBoundary>
                  <React.Suspense fallback={<Loading />}>
                    <App />
                  </React.Suspense>
                </ErrorBoundary>
              </AuthProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </OverlayProvider>
      </Router>
      <GlobalStyle />
      <TitleAnnouncer />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
reportWebVitals();
