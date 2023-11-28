import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import i18n from 'i18next';
import { getTranslation, LANGUAGES } from 'mydatashare-core';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fetchDataConsumer } from 'api/get';
import Alert from 'components/alert';
import AnnouncingLink from 'components/announcing-link';
import Breadcrumbs from 'components/breadcrumbs';
import Button from 'components/button';
import InlineHeadingWrapper from 'components/inline-heading-wrapper';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import { useAuth } from 'context/auth';
import { useTitle, useTranslationMetadata } from 'hooks';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getApiObject } from 'util/mds-api';

const DataConsumer = ({ match }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  useTitle('pageTitleDataConsumer', t);
  const { uuid } = match.params;
  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey: ['dataConsumer', { uuid }],
    queryFn: fetchDataConsumer,
  });

  const dataConsumer = getApiObject(data?.data_consumers);
  const translationMeta = useTranslationMetadata(data, dataConsumer);
  if (isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1>{t('headingDataConsumer')}</h1>
        <Loading />
      </>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const isTargeted =
    !!dataConsumer.ext_api_uuid &&
    'ext_apis' in data &&
    dataConsumer.ext_api_uuid in data.ext_apis;
  const extAPI = !isTargeted ? null : data.ext_apis[dataConsumer.ext_api_uuid];
  let metadatas = {};
  if ('metadatas' in data) {
    metadatas = data.metadatas;
  }

  let dataProvider = null;
  if (
    dataConsumer.data_provider_uuid !== null &&
    'data_providers' in data &&
    dataConsumer.data_provider_uuid in data.data_providers
  ) {
    dataProvider = data.data_providers[dataConsumer.data_provider_uuid];
  }
  return (
    <>
      <Breadcrumbs />
      <InlineHeadingWrapper>
        <h1 id="heading-dc-name">{dataConsumer.name}</h1>
        {user.organization.uuid === dataConsumer.organization_uuid && (
          <Button
            id="btn-edit-dc"
            variant="secondary"
            text={t('labelEdit')}
            to={`${match.url}/edit`}
            size="small"
          />
        )}
      </InlineHeadingWrapper>
      {dataConsumer.suspended && (
        <StyledAlertWrapper>
          <Alert id="alert-service-suspended" variant="info">
            {t('textServiceSuspended')}
          </Alert>
        </StyledAlertWrapper>
      )}
      {extAPI && (
        <LabeledValue
          label={t('labelRecordTargetGroup')}
          value={
            <AnnouncingLink to={`${match.url}/members`}>
              {getTranslation(
                extAPI,
                'name',
                LANGUAGES[i18n.language],
                metadatas
              )}
            </AnnouncingLink>
          }
        />
      )}
      <LabeledValue
        label={t('labelConsumerRecordType')}
        value={t(dataConsumer.record_type)}
      />
      <LabeledValue
        label={t('activation_mode')}
        value={t(dataConsumer.activation_mode)}
      />
      {dataProvider && (
        <LabeledValue
          label={t('labelDataProvider')}
          value={
            dataProvider ? (
              <AnnouncingLink to={`/dataProviders/${dataProvider.uuid}`}>
                {dataProvider.name}
              </AnnouncingLink>
            ) : null
          }
        />
      )}
      <LabeledValue
        label={t('default_language')}
        value={t(dataConsumer.default_language)}
      />
      <LabeledValue markdown label={t('name')} value={dataConsumer.name} />
      <LabeledValue
        markdown
        label={t('purpose')}
        value={dataConsumer.purpose}
      />
      <LabeledValue
        markdown
        label={t('description')}
        value={dataConsumer.description}
      />
      <LabeledValue markdown label={t('legal')} value={dataConsumer.legal} />
      <LabeledValue
        markdown
        label={t('pre_cancellation')}
        value={dataConsumer.pre_cancellation}
      />
      <LabeledValue
        markdown
        label={t('post_cancellation')}
        value={dataConsumer.post_cancellation}
      />
      <h2>{t('headingLocalizations')}</h2>
      {Object.values(translationMeta).map((meta) => (
        <React.Fragment key={meta.uuid}>
          <h3>{t(meta.subtype1)}</h3>
          {Object.entries(meta.json_data).map(([fieldName, translation]) => (
            <LabeledValue
              idPostfix={meta.subtype1}
              key={fieldName}
              markdown
              label={t(fieldName)}
              value={translation}
            />
          ))}
        </React.Fragment>
      ))}
      {Object.keys(translationMeta).length === 0 && (
        <p>
          <i>{t('textNoLocalizations')}</i>
        </p>
      )}
      <h2>{t('headingOtherInformation')}</h2>
      <LabeledValue label={t('uuid')} value={dataConsumer.uuid} />
      <LabeledValue
        label={t('created')}
        value={formatDate(dataConsumer.created)}
      />
      <LabeledValue
        label={t('updated')}
        value={formatDate(dataConsumer.updated)}
      />
      <LabeledValue label={t('suspended')} value={dataConsumer.suspended} />
      <hr />
      {extAPI ? (
        <Button
          id="btn-view-members"
          text={t('labelViewRecordTargetGroup')}
          variant="secondary"
          size="small"
          icon={<FontAwesomeIcon icon={icon({ name: 'users' })} />}
          to={`${match.url}/members`}
        />
      ) : (
        <Button
          id="btn-view-prs"
          text={t('labelViewProcessingRecords')}
          variant="secondary"
          size="small"
          to={`${match.url}/processingRecords`}
        />
      )}
    </>
  );
};

DataConsumer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default DataConsumer;

/* StyledComponents */

const StyledAlertWrapper = styled.div`
  margin: 1.5em 0;
`;
