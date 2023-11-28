import { useInfiniteQuery } from '@tanstack/react-query';
import { combinePaginatedResponses, getUrlMetadata } from 'mydatashare-core';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { fetchAccessGateways } from 'api/search';
import Accordion from 'components/accordion';
import Button from 'components/button';
import Checkbox from 'components/checkbox';
import Flag from 'components/flag';
import Form from 'components/form';
import Loading from 'components/loading';
import Select from 'components/select';
import TextArea from 'components/text-area';
import TranslationForm from 'components/translation-form';
import { useTranslationMetadata } from 'hooks';
import { Model } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { flatten, getIdTypeData, sortIdTypeData } from 'util/form';

const DataProviderForm = ({
  dataProvider,
  metadatas,
  mutationFn,
  invalidateQueries,
  onSuccess,
  onDeleteSuccess,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const translationMeta = useTranslationMetadata({ metadatas }, dataProvider);
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
  if (isLoading) {
    return <Loading />;
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const combinedAgwData = data.pages
    ? combinePaginatedResponses(data.pages)
    : {};
  const accessGateways = data.pages ? combinedAgwData.access_gateways : {};
  const accessGatewayMetadatas = combinedAgwData.metadatas
    ? combinedAgwData.metadatas
    : {};
  return (
    <Form
      mutationFn={(args) => {
        if ('suspended' in args.payload.dataProvider) {
          return mutationFn({ dataProvider, ...args });
        }
        // eslint-disable-next-line no-param-reassign
        args.payload.dataProvider = flatten(args.payload.dataProvider);

        // Custom code for copying URL metadata from AGW, and handling deletion etc...
        // Get hold on possible old AGW URLs, to handle deletion
        const oldAgwUrls = Object.keys(metadatas).length
          ? Object.values(getUrlMetadata(metadatas, dataProvider)).filter(
              (meta) =>
                meta.subtype1 === Model.ACCESS_GATEWAY &&
                dataProvider['metadatas.uuid'].includes(meta.uuid)
            )
          : [];
        const newAgwUrlUuid = args.payload.access_gateway_url;

        // Delete all old AGW URLs, because AGW was unattached
        if (args.payload.dataProvider.access_gateway_uuid === '') {
          // eslint-disable-next-line no-param-reassign
          args.payload.dataProvider.access_gateway_uuid = null;
          if (oldAgwUrls.length) {
            // eslint-disable-next-line no-param-reassign
            if (!args.payload.deleted) args.payload.deleted = [];
            oldAgwUrls.forEach((meta) => {
              args.payload.deleted.push([Model.METADATA, meta.uuid]);
            });
          }
        } else {
          // AGW is attached, check if it or its URL was changed. Handle deletions etc.
          let oldAgwUrlObj;
          if (oldAgwUrls.length > 1) {
            // DP for some reason has multiple AGW URLs, delete the extra ones.
            // eslint-disable-next-line no-param-reassign
            if (!args.payload.deleted) args.payload.deleted = [];
            oldAgwUrls.forEach((meta) => {
              if (meta.subtype2 !== newAgwUrlUuid) {
                args.payload.deleted.push([Model.METADATA, meta.uuid]);
              } else {
                oldAgwUrlObj = meta;
              }
            });
          } else if (oldAgwUrls.length === 1) {
            // DP has one old AGW URL. Check later on if the new AGW URL is a different one,
            // then delete the old.
            // eslint-disable-next-line prefer-destructuring
            oldAgwUrlObj = oldAgwUrls[0];
          }

          // We have updated the attached AGW – handle deleting old AGW URL
          // eslint-disable-next-line no-param-reassign
          delete args.payload.access_gateway_url;
          if (dataProvider && dataProvider.access_gateway_uuid) {
            if (!oldAgwUrlObj || oldAgwUrlObj.uuid !== newAgwUrlUuid) {
              if (oldAgwUrlObj) {
                // Delete the old AGW URL
                // eslint-disable-next-line no-param-reassign
                if (!args.payload.deleted) args.payload.deleted = [];
                args.payload.deleted.push([Model.METADATA, oldAgwUrlObj.uuid]);
              }
            }
          }
          const agwMetaObj = Object.values(accessGatewayMetadatas).find(
            (meta) => meta.uuid === newAgwUrlUuid
          );
          const agwUrlFormData = {
            name: agwMetaObj.name,
            url_type: agwMetaObj.subtype1,
            url: agwMetaObj.json_data.url,
            method_type: agwMetaObj.json_data.method_type,
            subtype2: agwMetaObj.uuid,
          };
          // eslint-disable-next-line no-param-reassign
          args.payload.urls = [agwUrlFormData];
        }
        return mutationFn({ dataProvider, metadatas, ...args });
      }}
      invalidateQueries={invalidateQueries}
      onSuccess={onSuccess}
      onDeleteSuccess={onDeleteSuccess}
      onCancel={() => history.push('.')}
      submitLabel={dataProvider ? 'labelFormSubmit' : 'labelFormCreate'}
      includeDelete={!!dataProvider}
      includeSuspend={!!dataProvider}
      isSuspended={dataProvider ? dataProvider.suspended : false}
      deleteLabel="labelDeleteDataProvider"
      deleteConfirmText={t('textConfirmDeleteDataProvider', {
        dataProviderName: dataProvider ? dataProvider.name : null,
      })}
      modelUuid={dataProvider ? dataProvider.uuid : null}
      modelName="data_provider"
      serviceName={dataProvider ? dataProvider.name : null}
      otherActionsChildren={
        dataProvider ? (
          <>
            <h3>{t('headingRequestClient')}</h3>
            <p>{t('textRequestClientForService')}</p>
            <Button
              id="btn-request-client"
              text={t('labelRequestClient')}
              variant="secondary"
              size="small"
              to="/clientRequest?type=organization"
            />
          </>
        ) : null
      }
    >
      <DataProviderFormContent
        dataProvider={dataProvider}
        metadatas={metadatas}
        translationMeta={translationMeta}
        accessGateways={accessGateways}
        accessGatewayMetadatas={accessGatewayMetadatas}
      />
    </Form>
  );
};

DataProviderForm.propTypes = {
  mutationFn: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  dataProvider: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  metadatas: PropTypes.object,
  invalidateQueries: PropTypes.arrayOf(PropTypes.any),
  onSuccess: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func,
};

DataProviderForm.defaultProps = {
  dataProvider: null,
  metadatas: {},
  invalidateQueries: [],
  onDeleteSuccess: null,
};

const DataProviderFormContent = ({
  dataProvider,
  metadatas,
  translationMeta,
  accessGateways,
  accessGatewayMetadatas,
}) => {
  const { t } = useTranslation();
  const selectedInputIdTypes = useWatch({
    name: 'dataProvider.input_id_types.uuid',
  });
  const dp = dataProvider || {};
  const agwUuid = dataProvider ? dataProvider.access_gateway_uuid : null;
  let urlUuid;
  if (agwUuid) {
    const agwUrl = Object.keys(accessGatewayMetadatas).length
      ? Object.values(getUrlMetadata(metadatas, dataProvider)).find(
          (meta) =>
            dataProvider['metadatas.uuid'].includes(meta.uuid) &&
            meta.subtype1 === Model.ACCESS_GATEWAY
        )
      : null;
    if (agwUrl) urlUuid = agwUrl.subtype2;
  }
  const idTypeData = getIdTypeData(t, 'dataProvider');
  const govIdTypes = [];
  const commonIdTypes = [];
  const otherIdTypes = [];
  Object.values(idTypeData).forEach((idt) => {
    if (idt.inputs) {
      if (idt.value.startsWith('ssn__')) govIdTypes.push(idt);
      else if (['phone_number', 'email'].includes(idt.value))
        commonIdTypes.push(idt);
      else otherIdTypes.push(idt);
    }
  });
  govIdTypes.sort((a, b) => sortIdTypeData(t, a, b));
  commonIdTypes.sort((a, b) => sortIdTypeData(t, a, b));
  otherIdTypes.sort((a, b) => sortIdTypeData(t, a, b));
  const selectedOtherIdTypes = getSelectedOtherIdTypes(
    selectedInputIdTypes,
    otherIdTypes
  );
  return (
    <>
      <Select
        required
        label={t('default_language')}
        id="default_language"
        name="dataProvider.default_language"
        defaultValue={dp.default_language}
      >
        <Select.Option value="fin">{t('fin')}</Select.Option>
        <Select.Option value="eng">{t('eng')}</Select.Option>
        <Select.Option value="swe">{t('swe')}</Select.Option>
      </Select>
      <TextArea
        id="name"
        name="dataProvider.name"
        label={t('name')}
        value={dp.name}
        placeholder={dp.name}
        required
      />
      <TextArea
        id="description"
        name="dataProvider.description"
        label={t('description')}
        value={dp.description}
        placeholder={dp.description}
        rows={4}
        required
      />
      <TextArea
        id="static_preview"
        name="dataProvider.static_preview"
        label={t('static_preview')}
        value={dp.static_preview}
        placeholder={dp.static_preview}
        rows={4}
        required
      />
      <AccessGatewayInput
        accessGatewayUuid={agwUuid}
        urlUuid={urlUuid}
        accessGateways={accessGateways}
        accessGatewayMetadatas={accessGatewayMetadatas}
      />
      {/* TODO: Show checkbox if/when has_live_preview is taken in to use */}
      {/* <Checkbox name="dataProvider.has_live_preview" checked={dp.has_live_preview}> */}
      {/*  {t('textHasLivePreview')} */}
      {/* </Checkbox> */}
      <div hidden>
        <Checkbox
          name="dataProvider.has_live_preview"
          id="checkbox-has-live-preview"
        />
      </div>
      {!dataProvider && (
        <>
          <h2>{t('headingDataProviderInput')}</h2>
          <p>{t('textEditDataProviderDataProviderInput')}</p>
          <p>{t('textEditDataProviderInputIdTypes')}</p>
          <StyledFlexHeadersWrapper>
            <StyledCheckboxSectionWrapper>
              <h3>{t('headingGovIdTypes')}</h3>
              {govIdTypes.map((idt) => (
                <IdTypeCheckbox key={idt.uuidValue} idt={idt} />
              ))}
            </StyledCheckboxSectionWrapper>
            <StyledCheckboxSectionWrapper>
              <h3>{t('headingCommonIdTypes')}</h3>
              {commonIdTypes.map((idt) => (
                <IdTypeCheckbox key={idt.uuidValue} idt={idt} />
              ))}
            </StyledCheckboxSectionWrapper>
          </StyledFlexHeadersWrapper>
          <StyledSection>
            <Accordion
              showToggle
              disabled={selectedOtherIdTypes.length > 0}
              titleComponent={<h3>{t('headingOtherIdTypes')}</h3>}
            >
              {otherIdTypes.map((idt) => (
                <IdTypeCheckbox key={idt.uuidValue} idt={idt} />
              ))}
            </Accordion>
          </StyledSection>
        </>
      )}

      <h2 id="heading-localization">{t('headingLocalizations')}</h2>
      <TranslationForm
        translationMetadatas={translationMeta}
        requiredFields={REQUIRED_TRANSLATION_FIELDS}
      />
    </>
  );
};

DataProviderFormContent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  dataProvider: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  metadatas: PropTypes.object,
  translationMeta: PropTypes.shape({
    lang: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    tr: PropTypes.object,
  }),
  // eslint-disable-next-line react/forbid-prop-types
  accessGateways: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  accessGatewayMetadatas: PropTypes.object,
};

DataProviderFormContent.defaultProps = {
  dataProvider: null,
  metadatas: {},
  translationMeta: {},
  accessGateways: {},
  accessGatewayMetadatas: {},
};

export default DataProviderForm;

/* Helpers */

const REQUIRED_TRANSLATION_FIELDS = ['name', 'description', 'static_preview'];

const getSelectedOtherIdTypes = (selectedIdTypes, otherIdTypes) => {
  if (!Array.isArray(selectedIdTypes)) {
    return [];
  }
  return selectedIdTypes.filter(
    (idt) => !!otherIdTypes.find((otherIdt) => otherIdt.uuidValue === idt)
  );
};

const AccessGatewayInput = ({
  accessGatewayUuid,
  urlUuid,
  accessGateways,
  accessGatewayMetadatas,
}) => {
  const { setValue } = useFormContext();
  const { t } = useTranslation();
  const defaultAgwValue = accessGatewayUuid || '';
  const defaultUrlValue = urlUuid || '';
  const agwUuid = useWatch({
    name: 'dataProvider.access_gateway_uuid',
    defaultValue: defaultAgwValue,
  });
  const selectedAgw = agwUuid.length ? accessGateways[agwUuid] : null;
  useEffect(() => {
    if (agwUuid === '') {
      setValue('access_gateway_url', '');
    }
  }, [agwUuid, setValue]);
  return (
    <>
      <Select
        label={t('access_gateway_uuid')}
        id="access_gateway_uuid"
        name="dataProvider.access_gateway_uuid"
        defaultValue={defaultAgwValue}
      >
        <Select.Option value="">{t('labelNoSelection')}</Select.Option>
        {accessGateways &&
          Object.values(accessGateways).map((agw) => (
            <Select.Option key={agw.uuid} value={agw.uuid}>
              {agw.name}
            </Select.Option>
          ))}
      </Select>
      <Select
        label={t('labelAccessGatewayUrl')}
        id="access_gateway_url"
        name="access_gateway_url"
        disabled={agwUuid === ''}
        required={agwUuid !== ''}
        defaultValue={defaultUrlValue}
      >
        <Select.Option value="">{t('labelNoSelection')}</Select.Option>
        {selectedAgw &&
          Object.values(
            getUrlMetadata(accessGatewayMetadatas, selectedAgw)
          ).map((meta) => (
            <Select.Option key={meta.uuid} value={meta.uuid}>
              {meta.json_data.url}
            </Select.Option>
          ))}
      </Select>
    </>
  );
};

AccessGatewayInput.propTypes = {
  accessGatewayUuid: PropTypes.string,
  urlUuid: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  accessGateways: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  accessGatewayMetadatas: PropTypes.object,
};

AccessGatewayInput.defaultProps = {
  accessGatewayUuid: null,
  urlUuid: null,
  accessGateways: {},
  accessGatewayMetadatas: {},
};

const IdTypeCheckbox = ({ idt }) => {
  const { t } = useTranslation();
  const { getValues } = useFormContext();
  const validation = {
    validate: () => {
      const { dataProvider: dpValues } = getValues();
      const selectedIdTypes = dpValues.input_id_types.uuid;
      return Array.isArray(selectedIdTypes) && selectedIdTypes.length > 0
        ? true
        : 'errorValidationInputIdTypeRequired';
    },
  };
  return (
    <Checkbox
      id={`input_id_type_${idt.value}`}
      key={idt.uuidValue}
      value={idt.uuidValue}
      name="dataProvider.input_id_types.uuid"
      options={validation}
      checked={false}
    >
      {idt.flag ? <Flag alpha2={idt.flag} text={t(idt.name)} /> : t(idt.name)}
    </Checkbox>
  );
};

IdTypeCheckbox.propTypes = {
  idt: PropTypes.shape({
    value: PropTypes.string.isRequired,
    uuidValue: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    flag: PropTypes.string,
  }).isRequired,
};

/* Styled Components */

const StyledFlexHeadersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5em;
  margin-top: 3em;
  h3 {
    margin-top: 0;
  }
`;

const StyledCheckboxSectionWrapper = styled.div`
  label:last-child {
    margin-bottom: 0;
  }
`;

const StyledSection = styled.div`
  margin-top: 5em;
  h3 {
    margin: 0;
  }
`;
