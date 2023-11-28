import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import AnnouncingLink from 'components/announcing-link';

const TabPanel = ({ links }) => {
  const { t } = useTranslation();
  // TODO: check accessibility
  // TODO: Make responsive
  return (
    <StyledWrapper>
      <StyledTabContainer>
        {links.map((l) => (
          <AnnouncingLink
            type="NavLink"
            exact
            key={l.title}
            to={l.to}
            id={`tab–${l.id}`}
          >
            {t(l.title)}
          </AnnouncingLink>
        ))}
      </StyledTabContainer>
      <StyledPanel>
        <Switch>
          {links.map((l) => (
            <Route key={l.title} exact path={l.to}>
              {l.component}
            </Route>
          ))}
        </Switch>
      </StyledPanel>
    </StyledWrapper>
  );
};

TabPanel.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      to: PropTypes.string,
      id: PropTypes.string,
      component: PropTypes.node,
    })
  ).isRequired,
};

export default TabPanel;

/* Styled Components */

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTabContainer = styled.div`
  display: flex;
  justify-content: center;
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex: 1;
    border: 1px solid ${(props) => props.theme.green800};
    color: #000;
    text-decoration: none;
    font-weight: bold;
    padding: 0.5em;
    cursor: pointer;
    transition:
      background-color 150ms ease-in,
      color 150ms ease-in;
    &:hover:not(.active) {
      background-color: ${(props) => props.theme.grey200};
    }
    &.active {
      background-color: ${(props) => props.theme.green800};
      color: #fff;
    }
    :not(:first-child) {
      border-left: none;
    }
  }
`;

const StyledPanel = styled.div`
  border: 1px solid ${(props) => props.theme.grey300};
  border-top: none;
  padding-top: 1em;
  & > *:not(.table) {
    padding: 0 2em;
  }
`;
