import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useInfiniteQuery } from '@tanstack/react-query';
import { combinePaginatedResponses } from 'mydatashare-core';
import PropTypes from 'prop-types';
import React from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { createSupportRequest } from 'api/create';
import { fetchAccessGateways } from 'api/search';
import Alert from 'components/alert';
import AnnouncingLink from 'components/announcing-link';
import Button from 'components/button';
import Form from 'components/form';
import Input from 'components/input';
import Loading from 'components/loading';
import RequesterInputs from 'components/requester-inputs';
import Select from 'components/select';
import { useQueryParams, useTitle } from 'hooks';
import { Model } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';

const CLIENT_TYPES = [
  Model.ORGANIZATION,
  Model.ACCESS_GATEWAY,
  'relying_party',
];

const ClientRequest = () => {
  const [success, setSuccess] = React.useState(false);
  const { t } = useTranslation();
  const history = useHistory();
  const queryParams = useQueryParams();
  const clientTypeParam = queryParams.get('type');
  const preselectedClientType = CLIENT_TYPES.includes(clientTypeParam)
    ? clientTypeParam
    : null;
  const accessGatewayUuid = queryParams.get('access_gateway_uuid');
  useTitle('pageTitleClientRequest', t);
  return (
    <>
      <h1 id="heading-client-request">{t('headingClientRequest')}</h1>
      {success ? (
        <div>
          <p id="text-client-request-sent">{t('textClientRequestSent')}</p>
          <AnnouncingLink id="link-back-home" to="/">
            {t('labelBackHome')}
          </AnnouncingLink>
        </div>
      ) : (
        <>
          <p>
            <Trans i18nKey="textClientRequestInfo">
              If you are unsure, instructions and explanations why your
              organization might need these can be found from the
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.mydatashare.com/dev"
              >
                developer portal
              </a>
              .
            </Trans>
          </p>
          <h2>{t('headingClientInformation')}</h2>
          <Form
            onCancel={() => history.push('.')}
            onSuccess={() => setSuccess(true)}
            mutationFn={createSupportRequest}
            submitLabel={t('labelSend')}
          >
            <ClientRequestFormContent
              clientType={preselectedClientType}
              accessGatewayUuid={accessGatewayUuid}
            />
          </Form>
        </>
      )}
    </>
  );
};

const ClientRequestFormContent = ({ clientType, accessGatewayUuid }) => {
  const { t } = useTranslation();
  const defaultClientType = clientType || Model.ORGANIZATION;
  const selectedClientType = useWatch({
    name: 'data.client_type',
    defaultValue: defaultClientType,
  });

  return (
    <>
      <Select
        label={t('labelClientType')}
        name="data.client_type"
        id="clientTypeSelect"
        defaultValue={defaultClientType}
        required
      >
        {CLIENT_TYPES.map((clientTypeOption) => (
          <Select.Option key={clientTypeOption} value={clientTypeOption}>
            {t(clientTypeOption)}
          </Select.Option>
        ))}
      </Select>
      <Input
        name="data.name"
        id="nameInput"
        required
        label={t('labelNameOrUsage')}
      />

      {selectedClientType === Model.ACCESS_GATEWAY && (
        <AccessGatewayClient accessGatewayUuid={accessGatewayUuid} />
      )}
      {selectedClientType === Model.ORGANIZATION && <OrganizationClient />}
      {selectedClientType === 'relying_party' && <RelyingPartyClient />}

      <RequesterInputs />
      <StyledAlertWrapper>
        <Alert id="alert-request-info" variant="info">
          {t('textClientRequestInfoAlert')}
        </Alert>
      </StyledAlertWrapper>
    </>
  );
};

ClientRequestFormContent.propTypes = {
  clientType: PropTypes.oneOf(CLIENT_TYPES),
  accessGatewayUuid: PropTypes.string,
};

ClientRequestFormContent.defaultProps = {
  clientType: CLIENT_TYPES[0],
  accessGatewayUuid: null,
};

const AccessGatewayClient = ({ accessGatewayUuid }) => {
  const { t } = useTranslation();
  const {
    data,
    isError,
    isLoading,
    isSuccess,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['accessGateways'],
    queryFn: fetchAccessGateways,
  });
  if (!isLoading && !isFetchingNextPage && hasNextPage) {
    fetchNextPage();
  }

  if (isLoading || isFetchingNextPage) {
    return (
      <StyledLoadingWrapper>
        <Loading />
      </StyledLoadingWrapper>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const combinedData = data.pages ? combinePaginatedResponses(data.pages) : {};
  const accessGateways = data.pages
    ? Object.values(combinedData.access_gateways)
    : [];
  const defaultValue = accessGatewayUuid || '';
  return (
    <>
      {accessGateways.length === 0 && (
        <StyledAlertWrapper>
          <Alert variant="warning">
            <Trans i18nKey="textClientRequestNoAccessGateways">
              Organization has no Access Gateways defined, so you cannot yet use
              a client with that type. Create an Access Gateway
              <AnnouncingLink to="/accessGateways/create">here</AnnouncingLink>.
            </Trans>
          </Alert>
        </StyledAlertWrapper>
      )}
      <Select
        id="accessGatewaySelect"
        name="data.access_gateway_uuid"
        label={t('access_gateway')}
        defaultValue={defaultValue}
        required
      >
        <Select.Option value="">{t('labelNoSelection')}</Select.Option>
        {accessGateways.map((agw) => (
          <Select.Option key={agw.uuid} value={agw.uuid}>
            {agw.name}
          </Select.Option>
        ))}
      </Select>
    </>
  );
};

AccessGatewayClient.propTypes = {
  accessGatewayUuid: PropTypes.string,
};

AccessGatewayClient.defaultProps = {
  accessGatewayUuid: null,
};

const OrganizationClient = () => {
  const { t } = useTranslation();
  return (
    <Select
      id="tokenAuthMethodSelect"
      name="data.token_auth_method"
      label={t('labelTokenAuthMethod')}
      required
    >
      <Select.Option value="client_secret_basic">
        Client secret basic
      </Select.Option>
      <Select.Option value="client_secret_post">
        Client secret POST
      </Select.Option>
    </Select>
  );
};

const RelyingPartyClient = () => {
  const { t } = useTranslation();
  const {
    fields: fieldsLoginUrl,
    append: appendLoginUrl,
    remove: removeLoginUrl,
  } = useFieldArray({ name: 'data.login_urls', shouldUnregister: true });
  const {
    fields: fieldsLogoutUrl,
    append: appendLogoutUrl,
    remove: removeLogoutUrl,
  } = useFieldArray({ name: 'data.logout_urls', shouldUnregister: true });
  return (
    <StyledRelyingPartyWrapper>
      <h3>{t('headingLoginUrls')}</h3>
      {fieldsLoginUrl.map((formValues, index) => (
        <StyledInlineButtonWrapper key={formValues.id}>
          <StyledUrlInputWrapper>
            <Input
              id={formValues.id}
              name={`data.login_urls.${index}.url`}
              type="url"
            />
          </StyledUrlInputWrapper>
          <Button
            id={`data.login_urls.${index}.btn-delete`}
            type="button"
            variant="text"
            text={t('labelDelete')}
            onClick={() => removeLoginUrl(index)}
            colorVariant="negative"
            icon={<FontAwesomeIcon icon={icon({ name: 'trash' })} />}
          />
        </StyledInlineButtonWrapper>
      ))}
      <Button
        id="btn-add-login-url"
        type="button"
        text={t('labelAddLoginUrl')}
        variant="text"
        icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
        onClick={() => appendLoginUrl({ url: '' })}
      />
      <h3>{t('headingLogoutUrls')}</h3>
      {fieldsLogoutUrl.map((formValues, index) => (
        <StyledInlineButtonWrapper key={formValues.id}>
          <StyledUrlInputWrapper>
            <Input
              id={formValues.id}
              name={`data.logout_urls.${index}.url`}
              type="url"
            />
          </StyledUrlInputWrapper>
          <Button
            id={`data.logout_urls.${index}.btn-delete`}
            type="button"
            variant="text"
            text={t('labelDelete')}
            onClick={() => removeLogoutUrl(index)}
            colorVariant="negative"
            icon={<FontAwesomeIcon icon={icon({ name: 'trash' })} />}
          />
        </StyledInlineButtonWrapper>
      ))}
      <Button
        id="btn-add-logout-url"
        type="button"
        text={t('labelAddLogoutUrl')}
        variant="text"
        icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
        onClick={() => appendLogoutUrl({ url: '' })}
      />
    </StyledRelyingPartyWrapper>
  );
};

export default ClientRequest;

/* Styled Components */

const StyledLoadingWrapper = styled.div`
  margin: 4.75em 0;
`;

const StyledRelyingPartyWrapper = styled.div`
  button {
    margin-top: 1em;
  }
`;

const StyledInlineButtonWrapper = styled.div`
  display: flex;
  button {
    margin: 1.6em 0 0 2em;
  }
`;

const StyledUrlInputWrapper = styled.div`
  flex-grow: 1;
`;

const StyledAlertWrapper = styled.div`
  margin: 1.5em 0;
`;
