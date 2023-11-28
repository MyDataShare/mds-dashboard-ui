import Layout from 'layout';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { removeUserFromStorage } from 'util/storage';

interface Props {
  message: string;
  logOutUser?: boolean;
}

const Error = ({ message, logOutUser = false }: Props) => {
  const { t } = useTranslation();

  if (logOutUser) {
    removeUserFromStorage();
  }

  return (
    <Layout>
      <StyledWrapper>
        <h1 id="heading-error">{t('headingError')}</h1>
        {message && <p>{t(message)}</p>}
        <a id="link-back-home" href="/">
          {t('labelBackHome')}
        </a>
      </StyledWrapper>
    </Layout>
  );
};

export default Error;

const StyledWrapper = styled.div`
  width: 100%;
  display: grid;
  justify-items: center;
  align-items: center;
`;
