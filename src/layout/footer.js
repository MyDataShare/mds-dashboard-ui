import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ReactComponent as Logo } from 'assets/vastuu-group.svg';
import { WALLET_URL } from 'util/constants';
import { getLocalizedUrl } from 'util/general';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <StyledFooterWrapper>
      <StyledFooterInnerWrapper>
        <StyledFooterContent>
          <StyledFooterTitleWrapper>
            <Logo alt="Vastuu Group" />
            <StyledFooterHeader>{t('appTitle')}</StyledFooterHeader>
          </StyledFooterTitleWrapper>
          <StyledFooterNavSection>
            <StyledFooterItem>
              <a
                id="link-footer-wallet"
                href={getLocalizedUrl(WALLET_URL)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('myDataShareWallet')}
              </a>
            </StyledFooterItem>
            <StyledFooterItem>
              <a
                id="link-footer-mds"
                href="https://www.mydatashare.com"
                target="_blank"
                rel="noopener noreferrer"
                hrefLang="en"
              >
                {t('myDataShare')}
              </a>
            </StyledFooterItem>
            <StyledFooterItem>
              <a
                id="link-footer-terms"
                href={getLocalizedUrl(`${WALLET_URL}/terms`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('labelTos')}
              </a>
            </StyledFooterItem>
            <StyledFooterItem>
              <a
                id="link-footer-privacy"
                href={getLocalizedUrl(`${WALLET_URL}/privacy`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('labelPrivacy')}
              </a>
            </StyledFooterItem>
          </StyledFooterNavSection>
        </StyledFooterContent>
      </StyledFooterInnerWrapper>
    </StyledFooterWrapper>
  );
};

export default Footer;

/* Styled Components */

const StyledFooterWrapper = styled.footer`
  margin: 4em 0 auto auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${(props) => props.theme.grey200};
`;

const StyledFooterInnerWrapper = styled.div`
  width: 100%;
  padding: 3em 1.5em 4em 1.5em;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledFooterContent = styled.div`
  width: 100%;
  max-width: 80em;
`;

const StyledFooterTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
  @media only screen and (max-width: 26em) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const StyledFooterHeader = styled.h2`
  font-size: 1em;
  margin: 0 0 0 1em;
  @media only screen and (max-width: 26em) {
    margin: 1em 0 0 0;
  }
`;

const StyledFooterNavSection = styled.nav`
  justify-content: ${(props) =>
    props.justifyContent ? props.justifyContent : 'flex-start'};
  display: flex;
  flex-wrap: wrap;
  margin-top: 0.75em;
  margin: 0.75em -1em 0 -1em;
  a {
    text-decoration: none;
  }
  span:hover {
    text-decoration: underline;
  }
  @media only screen and (max-width: 26em) {
    flex-direction: column;
    margin: 1.5em -1em 0 -1em;
  }
`;

const StyledFooterItem = styled.span`
  font-weight: 500;
  margin: 1em 1em 0 1em;
  a {
    color: #000000;
  }
`;
