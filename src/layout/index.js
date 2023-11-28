import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import Footer from 'layout/footer';
import Header from 'layout/header';
import Main from 'layout/main';

const Layout = ({ children }) => (
  <PageWrapper>
    <Header />
    <Main>{children}</Main>
    <Footer />
  </PageWrapper>
);

Layout.propTypes = {
  children: PropTypes.node,
};

Layout.defaultProps = {
  children: null,
};

export default Layout;

/* Styled Components */

const PageWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'header'
    'content'
    'footer';
`;
