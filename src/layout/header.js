import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import headerLogo from 'assets/header-logo.png';
import AnnouncingLink from 'components/announcing-link';
import Dropdown from 'components/dropdown';
import { useAuth } from 'context/auth';
import { useWindowDimensions } from 'hooks';
import {
  HEADER_MENU_BREAKPOINT,
  HEADER_MENU_BREAKPOINT_PX,
} from 'util/constants';
import { stringToAlpha } from 'util/string';

const Header = () => {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const isMobile = width <= HEADER_MENU_BREAKPOINT;
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div>
      <StyledHeaderContainer>
        <StyledHeaderContent>
          <StyledHeaderPersistentContent>
            <StyledTitleSection to="/" id="link-header-home">
              <HeaderImage src={headerLogo} />
              <span>{t('appTitleShort')}</span>
            </StyledTitleSection>
            {isMobile && (
              <StyledMenuButton
                onClick={() => setIsOpen(!isOpen)}
                id="btn-header-menu"
              >
                {isOpen ? (
                  <FontAwesomeIcon
                    icon={icon({ name: 'xmark' })}
                    font-size="1.5em"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={icon({ name: 'bars' })}
                    font-size="1.5em"
                  />
                )}
              </StyledMenuButton>
            )}
          </StyledHeaderPersistentContent>
          <NavSection isOpen={isOpen} />
        </StyledHeaderContent>
      </StyledHeaderContainer>
    </div>
  );
};

const NavSection = ({ isOpen }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const auth = useAuth(true);
  let isLoggedIn = true; // User is logged in with name data and has organization selected
  let isAuthenticated = true; // User is authenticated (has token) but no name data nor org select
  if (!auth?.user?.givenName?.length) {
    isLoggedIn = false;
  }
  if (!auth?.user) {
    isAuthenticated = false;
  }
  let username = '';
  if (isLoggedIn) {
    username = auth.user.username;
  }

  return (
    <StyledNavSection $isOpen={isOpen}>
      <StyledNavItem>
        <Dropdown
          id="btn-header-lng"
          text={t('labelLanguage')}
          icon={<FontAwesomeIcon icon={icon({ name: 'globe' })} />}
        >
          <Dropdown.Item
            id="btn-header-lng-fi"
            text="Suomi"
            onClick={() => i18n.changeLanguage('fi')}
            lang="fi"
          />
          <Dropdown.Item
            id="btn-header-lng-en"
            text="English"
            onClick={() => i18n.changeLanguage('en')}
            lang="en"
          />
          <Dropdown.Item
            id="btn-header-lng-sv"
            text="Svenska"
            onClick={() => i18n.changeLanguage('sv')}
            lang="sv"
          />
        </Dropdown>
      </StyledNavItem>
      {isAuthenticated && (
        <>
          {!!auth.user?.organization && (
            <StyledNavItem>
              <Dropdown id="btn-header-org" text={auth.user.organization.name}>
                {Object.keys(auth.user.organizations).length > 1 ? (
                  <>
                    <Dropdown.Label text={t('labelOrganizationsToManage')} />
                    {Object.values(auth.user.organizationIdentifiers)
                      .filter(
                        (orgIdentifier) =>
                          orgIdentifier.organization_uuid !==
                          auth.user.organization.uuid
                      )
                      .map((orgIdentifier) => {
                        const org =
                          auth.user.organizations[
                            orgIdentifier.organization_uuid
                          ];
                        return org ? (
                          <Dropdown.Item
                            id={`btn-header-org-${stringToAlpha(org.name)}`}
                            key={org.uuid}
                            text={org.name}
                            onClick={() =>
                              auth.selectOrganizationIdentifier(orgIdentifier)
                            }
                          />
                        ) : null;
                      })}
                    <hr />
                  </>
                ) : null}
                <Dropdown.Item
                  id="btn-header-org-request-org"
                  text={t('labelRequestOrganization')}
                  onClick={() => {
                    if (history.location.pathname !== '/organizationRequest') {
                      history.push('/organizationRequest');
                    }
                  }}
                />
              </Dropdown>
            </StyledNavItem>
          )}
          {isLoggedIn && (
            <StyledNavItem>
              <Dropdown id="btn-header-user" text={username}>
                {isLoggedIn && (
                  <Dropdown.Item
                    id="btn-header-user-logout"
                    text={t('labelLogOut')}
                    onClick={auth.logout}
                  />
                )}
              </Dropdown>
            </StyledNavItem>
          )}
        </>
      )}
      {!isLoggedIn && isAuthenticated && (
        <StyledNavItem>
          <StyledHeaderButton type="button" onClick={auth.logout}>
            {t('labelLogOut')}
          </StyledHeaderButton>
        </StyledNavItem>
      )}
    </StyledNavSection>
  );
};

NavSection.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default Header;

/* Styled Components */

const StyledHeaderContainer = styled.header`
  width: 100%;
  padding: 0 1.5em;
  @media only screen and (max-width: 350px) {
    padding: 0 0.5em;
  }
  @media only screen and (max-width: ${HEADER_MENU_BREAKPOINT_PX}) {
    border-bottom: 0.063em solid ${(props) => props.theme.grey300};
  }
`;

const StyledHeaderContent = styled.div`
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media only screen and (max-width: ${HEADER_MENU_BREAKPOINT_PX}) {
    flex-direction: column;
    align-items: flex-end;
  }
`;

const StyledHeaderPersistentContent = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitleSection = styled(AnnouncingLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  font-weight: 500;
  height: 3.5em;
  * + * {
    margin-left: 0.75em;
  }
  @media only screen and (max-width: 350px) {
    * + * {
      margin-left: 0.5em;
    }
  }
`;

const StyledNavSection = styled.div`
  display: flex;
  height: 100%;
  white-space: nowrap;
  align-items: center;
  a {
    text-decoration: none;
  }
  @media only screen and (max-width: ${HEADER_MENU_BREAKPOINT_PX}) {
    display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
    flex-direction: column;
    align-items: flex-end;
    padding: 1em 0 1.5em 0;
  }
`;

const StyledNavItem = styled.span`
  &&:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const StyledMenuButton = styled.button`
  height: 1.5em;
  width: 1.5em;
  display: none;
  cursor: pointer;
  @media only screen and (max-width: ${HEADER_MENU_BREAKPOINT_PX}) {
    display: inline;
  }
`;

const HeaderImage = styled.img`
  height: 40%;
`;

const StyledHeaderButton = styled.button`
  font-weight: ${(props) => props.theme.fontMedium};
  margin-left: 1em;
`;
