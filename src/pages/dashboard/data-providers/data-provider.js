import { useQuery } from '@tanstack/react-query';
import { getUrlMetadata } from 'mydatashare-core';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fetchDataProvider } from 'api/get';
import Alert from 'components/alert';
import AnnouncingLink from 'components/announcing-link';
import Breadcrumbs from 'components/breadcrumbs';
import Button from 'components/button';
import Chip from 'components/chip';
import Flag from 'components/flag';
import InlineHeadingWrapper from 'components/inline-heading-wrapper';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import { useAuth } from 'context/auth';
import { useTitle, useTranslationMetadata } from 'hooks';
import { Model } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getIdTypeData, sortIdTypeData } from 'util/form';
import { getApiObject } from 'util/mds-api';

const DataProvider = ({ match }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  useTitle('pageTitleDataProvider', t);
  const { uuid } = match.params;
  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey: ['dataProvider', { uuid }],
    queryFn: fetchDataProvider,
  });

  const dataProvider = getApiObject(data?.data_providers);
  const translationMeta = useTranslationMetadata(data, dataProvider);
  if (isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1>{t('headingDataProvider')}</h1>
        <Loading />
      </>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const hasAgw = !!dataProvider.access_gateway_uuid;
  let agw;
  let agwUrl;
  if (hasAgw) {
    agw = data.access_gateways[dataProvider.access_gateway_uuid];
    if (data.metadatas) {
      agwUrl = Object.values(getUrlMetadata(data.metadatas, dataProvider)).find(
        (meta) =>
          meta.subtype1 === Model.ACCESS_GATEWAY &&
          meta.model === Model.DATA_PROVIDER
      );
    }
  }
  const idTypeData = getIdTypeData(t, 'dataProvider');
  const sortedIdTypes = dataProvider['input_id_types.uuid']
    .map((idTypeUuid) =>
      Object.values(idTypeData).find((d) => d.uuidValue === idTypeUuid)
    )
    .sort((a, b) => sortIdTypeData(t, a, b));
  return (
    <>
      <Breadcrumbs />
      <InlineHeadingWrapper>
        <h1 id="heading-dp-name">{dataProvider.name}</h1>
        {user.organization.uuid === dataProvider.organization_uuid && (
          <Button
            id="btn-edit-dp"
            variant="secondary"
            text={t('labelEdit')}
            to={`${match.url}/edit`}
            size="small"
          />
        )}
      </InlineHeadingWrapper>
      {dataProvider.suspended && (
        <StyledAlertWrapper>
          <Alert id="alert-service-suspended" variant="info">
            <p>{t('textServiceSuspended')}</p>
          </Alert>
        </StyledAlertWrapper>
      )}
      {hasAgw && dataProvider['input_id_types.uuid'].length === 0 && (
        <StyledAlertWrapper>
          <Alert
            id="alert-dp-incomplete"
            variant="warning"
            heading={t('headingConfigurationIncomplete')}
          >
            <p>{t('textDataProviderInputMissing')}</p>
          </Alert>
        </StyledAlertWrapper>
      )}
      <LabeledValue
        label={t('default_language')}
        value={t(dataProvider.default_language)}
      />
      <LabeledValue markdown label={t('name')} value={dataProvider.name} />
      <LabeledValue
        markdown
        label={t('description')}
        value={dataProvider.description}
      />
      <LabeledValue
        markdown
        label={t('static_preview')}
        value={dataProvider.static_preview}
      />
      {/* TODO: Uncomment if/when has_live_preview is in use */}
      {/* <LabeledValue */}
      {/*  label={t('has_live_preview')} */}
      {/*  value={( */}
      {/*    <IconText */}
      {/*      text={t(dataProvider.has_live_preview */}
      {/*        ? 'textHasLivePreview' */}
      {/*        : 'textNoLivePreview')} */}
      {/*      icon={dataProvider.has_live_preview */}
      {/*        ? <CheckIcon color={theme.vgGreen} /> */}
      {/*        : <CrossIcon color={theme.errorColor} />} */}
      {/*    /> */}
      {/*      )} */}
      {/* /> */}

      <h2 id="heading-agw">{t('headingAccessGateway')}</h2>
      <LabeledValue
        label={t('headingAccessGateway')}
        value={
          hasAgw ? (
            <AnnouncingLink id="link-agw" to={`/accessGateways/${agw.uuid}`}>
              {agw.name}
            </AnnouncingLink>
          ) : null
        }
      />
      {agwUrl && (
        <>
          <LabeledValue
            label={t('labelAccessGatewayUrlName')}
            value={agwUrl.name}
          />
          <LabeledValue
            label={t('labelAccessGatewayUrl')}
            value={agwUrl.json_data.url}
          />
          <LabeledValue
            label={t('labelAccessGatewayUrlMethodType')}
            value={agwUrl.json_data.method_type.toUpperCase()}
          />
        </>
      )}

      <h2>{t('headingDataProviderInput')}</h2>
      <LabeledValue
        label={t('input_id_types')}
        value={
          dataProvider['input_id_types.uuid'].length > 0 ? (
            <Chip.Area>
              {sortedIdTypes.map((idt) => {
                const label = t(idt.name);
                return (
                  <Chip key={idt.uuidValue}>
                    {idt.flag ? <Flag alpha2={idt.flag} text={label} /> : label}
                  </Chip>
                );
              })}
            </Chip.Area>
          ) : null
        }
      />

      <h2>{t('headingLocalizations')}</h2>
      {Object.values(translationMeta).map((meta) => (
        <React.Fragment key={meta.uuid}>
          <h3>{t(meta.subtype1)}</h3>
          {Object.entries(meta.json_data).map(([fieldName, translation]) => (
            <LabeledValue
              key={fieldName}
              idPostfix={meta.subtype1}
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
      <LabeledValue label={t('uuid')} value={dataProvider.uuid} />
      <LabeledValue
        label={t('created')}
        value={formatDate(dataProvider.created)}
      />
      <LabeledValue
        label={t('updated')}
        value={formatDate(dataProvider.updated)}
      />
      <LabeledValue label={t('suspended')} value={dataProvider.suspended} />
    </>
  );
};

DataProvider.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default DataProvider;

/* StyledComponents */

const StyledAlertWrapper = styled.div`
  margin: 1.5em 0;
`;
