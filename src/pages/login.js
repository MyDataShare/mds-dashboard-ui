import { useQuery } from '@tanstack/react-query';
import { AuthItem, store } from 'mydatashare-core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fetchAuthItems } from 'api/search';
import Button from 'components/button';
import Loading from 'components/loading';
import { useTitle } from 'hooks';
import {
  AUTH_ITEM_NAMES,
  CLIENT_ID,
  QUERY_ERR_MSG_KEY,
  REDIRECT_URI,
  SCOPE,
} from 'util/constants';
import { stringToAlpha } from 'util/string';

const Login = () => {
  const { t } = useTranslation();
  useTitle('pageTitleLogin', t);
  const { status, data, isError, isLoading, isSuccess } = useQuery({
    queryKey: ['authItems'],
    queryFn: fetchAuthItems,
  });
  const [authItems, setAuthItems] = React.useState([]);

  React.useEffect(() => {
    if (!authItems.length && data && isSuccess) {
      store.parseApiResponse(data);
      const preselectedItems = AuthItem.asArray(store).filter((ai) =>
        AUTH_ITEM_NAMES.includes(ai.name)
      );
      if (preselectedItems.length !== AUTH_ITEM_NAMES.length) {
        throw new Error('Error fetching auth_items');
      }
      setAuthItems(preselectedItems);
    }
  }, [authItems, data, isSuccess, status]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  return (
    <>
      <h1 id="heading-login">{t('headingLogin1')}</h1>
      <p>{t('paragraphLogin')}</p>
      <div>
        {authItems.map((ai) => (
          <StyledWrapper key={ai.uuid}>
            <Button
              id={`btn-login-${stringToAlpha(ai.name)}`}
              text={ai.getTranslation('name')}
              variant="secondary"
              type="button"
              onClick={() =>
                ai.performAuthorization(CLIENT_ID, REDIRECT_URI, SCOPE)
              }
            />
          </StyledWrapper>
        ))}
      </div>
    </>
  );
};

export default Login;

/* Styled Components */

const StyledWrapper = styled.div`
  button {
    margin-top: ${(props) => props.theme.spacingM};
  }
`;
