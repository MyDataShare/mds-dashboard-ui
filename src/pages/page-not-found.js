import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AnnouncingLink from 'components/announcing-link';
import { useTitle } from 'hooks';

const PageNotFound = () => {
  const { t } = useTranslation();
  useTitle('pageTitleNotFound', t);
  return (
    <StyledWrapper>
      <h1 id="heading-page-not-found">{t('headingPageNotFound')}</h1>
      <AnnouncingLink id="link-back-home" to="/">
        {t('labelBackHome')}
      </AnnouncingLink>
    </StyledWrapper>
  );
};

export default PageNotFound;

const StyledWrapper = styled.div`
  width: 100%;
  display: grid;
  justify-items: center;
  align-items: center;
`;
