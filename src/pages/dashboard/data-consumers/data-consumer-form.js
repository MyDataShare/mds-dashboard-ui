import { useInfiniteQuery } from '@tanstack/react-query';
import i18n from 'i18next';
import {
  combinePaginatedResponses,
  getTranslation,
  LANGUAGES,
} from 'mydatashare-core';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { fetchExtAPIs } from 'api/search';
import Alert from 'components/alert';
import Button from 'components/button';
import Form from 'components/form';
import Input from 'components/input';
import Radio from 'components/radio';
import Select from 'components/select';
import TextArea from 'components/text-area';
import TranslationForm from 'components/translation-form';
import { ActivationMode, RecordType } from 'types/enums';
import { removeEmptyFields } from 'util/form';
import { DataConsumerProp, ExtAPIProp, MetadataProp } from 'util/prop-types';
import { VALIDATE_UUID } from 'util/validation';

const DataConsumerForm = ({
  dataConsumer,
  translationMetadatas,
  mutationFn,
  invalidateQueries,
  onSuccess,
  onDeleteSuccess,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const fetchExtAPIsEnabled = !dataConsumer;
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['extAPIs'],
      queryFn: fetchExtAPIs,
      enabled: fetchExtAPIsEnabled,
    });
  if (fetchExtAPIsEnabled && !isLoading && !isFetchingNextPage && hasNextPage) {
    fetchNextPage();
  }
  const extAPIsResponse =
    fetchExtAPIsEnabled && data?.pages
      ? combinePaginatedResponses(data.pages)
      : null;
  return (
    <Form
      mutationFn={(args) => {
        if ('on_behalf' in args.payload.dataConsumer) {
          // eslint-disable-next-line no-param-reassign
          args.payload.dataConsumer.activation_mode =
            args.payload.dataConsumer.on_behalf;
          // eslint-disable-next-line no-param-reassign
          delete args.payload.dataConsumer.on_behalf;
        }
        if ('suspended' in args.payload.dataConsumer) {
          return mutationFn({ dataConsumer, ...args });
        }
        if (
          [
            RecordType.LEGAL_OBLIGATION,
            RecordType.LEGITIMATE_INTEREST,
          ].includes(args.payload.dataConsumer.record_type)
        ) {
          // eslint-disable-next-line no-param-reassign
          args.payload.dataConsumer.activation_mode =
            ActivationMode.AUTOMATICALLY_ACTIVATED;
        }
        removeEmptyFields(args.payload.dataConsumer);
        return mutationFn({
          dataConsumer,
          metadatas: translationMetadatas,
          ...args,
        });
      }}
      invalidateQueries={invalidateQueries}
      onSuccess={onSuccess}
      onDeleteSuccess={onDeleteSuccess}
      onCancel={() => history.push('.')}
      submitLabel={dataConsumer ? 'labelFormSubmit' : 'labelFormCreate'}
      includeDelete={!!dataConsumer}
      includeSuspend={!!dataConsumer}
      isSuspended={dataConsumer ? dataConsumer.suspended : false}
      deleteLabel="labelDeleteDataConsumer"
      deleteConfirmText={t('textConfirmDeleteDataConsumer', {
        dataConsumerName: dataConsumer ? dataConsumer.name : null,
      })}
      modelUuid={dataConsumer ? dataConsumer.uuid : null}
      modelName="data_consumer"
      serviceName={dataConsumer ? dataConsumer.name : null}
      otherActionsChildren={
        dataConsumer ? (
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
      <DataConsumerFormContent
        dataConsumer={dataConsumer}
        extAPIsResponse={extAPIsResponse}
        translationMetadatas={translationMetadatas}
      />
    </Form>
  );
};

DataConsumerForm.propTypes = {
  mutationFn: PropTypes.func.isRequired,
  dataConsumer: DataConsumerProp,
  translationMetadatas: PropTypes.objectOf(MetadataProp),
  invalidateQueries: PropTypes.arrayOf(PropTypes.any),
  onSuccess: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func,
};

DataConsumerForm.defaultProps = {
  dataConsumer: null,
  translationMetadatas: null,
  invalidateQueries: [],
  onDeleteSuccess: () => null,
};

const DataConsumerFormContent = ({
  dataConsumer,
  extAPIsResponse,
  translationMetadatas,
}) => {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const dc = dataConsumer || {};
  const hasExternalAPIs =
    extAPIsResponse &&
    typeof extAPIsResponse.ext_apis === 'object' &&
    Object.values(extAPIsResponse.ext_apis).length > 0;
  const sortedExtAPIs = !hasExternalAPIs
    ? []
    : Object.values(extAPIsResponse.ext_apis)
        .map((eAPI) => {
          const translatedName = getTranslation(
            eAPI,
            'name',
            LANGUAGES[i18n.language],
            extAPIsResponse.metadatas
          );
          return {
            ...eAPI,
            name: translatedName,
          };
        })
        .sort((a, b) => (a.name > b.name ? 1 : -1));

  const selectedTargetGroup = useWatch({
    name: 'dataConsumer.ext_api_uuid',
    defaultValue: '',
  });
  const selectedRecordType = useWatch({
    name: 'dataConsumer.record_type',
    defaultValue: RecordType.CONSENT,
  });
  const selectedGrantMode = useWatch({
    name: 'dataConsumer.activation_mode',
    defaultValue: ActivationMode.DATA_SUBJECT_ACTIVATES,
  });

  useEffect(() => {
    // Prevent record_type from resetting to undefined when unmounting radio buttons
    if (selectedTargetGroup) {
      setValue('dataConsumer.record_type', RecordType.CONSENT);
    }
  }, [selectedTargetGroup, setValue]);

  return (
    <>
      {!dataConsumer && (
        <Input
          name="dataConsumer.data_provider_uuid"
          id="dataConsumer.data_provider_uuid"
          label={t('labelDataProviderUuid')}
          options={VALIDATE_UUID}
        />
      )}
      <Select
        required
        label={t('default_language')}
        id="default_language"
        name="dataConsumer.default_language"
        defaultValue={dc.default_language}
      >
        <Select.Option value="fin">{t('fin')}</Select.Option>
        <Select.Option value="eng">{t('eng')}</Select.Option>
        <Select.Option value="swe">{t('swe')}</Select.Option>
      </Select>
      <TextArea
        id="name"
        name="dataConsumer.name"
        label={t('name')}
        value={dc.name}
        placeholder={dc.name}
        required
      />
      <TextArea
        id="purpose"
        name="dataConsumer.purpose"
        label={t('purpose')}
        value={dc.purpose}
        placeholder={dc.purpose}
        rows={1}
        required
      />
      <TextArea
        id="description"
        name="dataConsumer.description"
        label={t('description')}
        value={dc.description}
        placeholder={dc.description}
        rows={4}
        required
      />
      <TextArea
        id="legal"
        name="dataConsumer.legal"
        label={t('legal')}
        value={dc.legal}
        placeholder={dc.legal}
        rows={6}
        required
      />
      <TextArea
        id="pre_cancellation"
        name="dataConsumer.pre_cancellation"
        label={t('pre_cancellation')}
        value={dc.pre_cancellation}
        placeholder={dc.pre_cancellation}
      />
      <TextArea
        id="post_cancellation"
        name="dataConsumer.post_cancellation"
        label={t('post_cancellation')}
        value={dc.post_cancellation}
        placeholder={dc.post_cancellation}
      />
      <h2 id="heading-localization">{t('headingLocalizations')}</h2>
      <TranslationForm
        translationMetadatas={translationMetadatas}
        requiredFields={REQUIRED_TRANSLATION_FIELDS}
        optionalFields={OPTIONAL_TRANSLATION_FIELDS}
      />
      {hasExternalAPIs && (
        <>
          <h2 id="heading-record-target-group">
            {t('headingRecordTargetGroup')}
          </h2>
          <p>{t('textRecordTargetGroupInfo')}</p>
          <Select
            name="dataConsumer.ext_api_uuid"
            id="ext_api"
            label={t('labelSelectRecordTargetGroup')}
          >
            <Select.Option value="">{t('labelNoSelection')}</Select.Option>
            {sortedExtAPIs.map((eAPI) => (
              <Select.Option key={eAPI.uuid} value={eAPI.uuid}>
                {eAPI.name}
              </Select.Option>
            ))}
          </Select>
        </>
      )}
      {!dataConsumer && (
        <>
          <h2 id="heading-record-type">{t('headingConsumerRecordType')}</h2>
          {selectedTargetGroup && (
            <StyledAlert variant="info">
              {t('textTargetedDCOnlyConsentsInfo')}
            </StyledAlert>
          )}
          <Radio.Group
            name="dataConsumer.record_type"
            label={t('labelConsumerRecordType')}
            defaultValue={RecordType.CONSENT}
            value={selectedRecordType}
            required
          >
            <Radio value={RecordType.CONSENT} help={t('textHelpConsent')}>
              {t('labelConsent')}
            </Radio>
            {!selectedTargetGroup && (
              <>
                <Radio
                  value={RecordType.LEGAL_OBLIGATION}
                  help={t('textHelpLegalObligation')}
                >
                  {t('labelLegalObligation')}
                </Radio>
                <Radio
                  value={RecordType.LEGITIMATE_INTEREST}
                  help={t('textHelpLegitimateInterest')}
                >
                  {t('labelLegitimateInterest')}
                </Radio>
              </>
            )}
          </Radio.Group>

          {selectedRecordType === RecordType.CONSENT && (
            <>
              <h2 id="heading-grant-mode">{t('headingGrantMode')}</h2>
              <StyledAlert variant="info">
                {t('textGrantModeConsentOnlyInfo')}
              </StyledAlert>
              <Select
                name="dataConsumer.activation_mode"
                id="activationMode"
                label={t('labelRecordGrantingBy')}
                help={t('helpRecordGrantingBy')}
                defaultValue={ActivationMode.DATA_SUBJECT_ACTIVATES}
                required
              >
                <Select.Option value={ActivationMode.DATA_SUBJECT_ACTIVATES}>
                  {t(ActivationMode.DATA_SUBJECT_ACTIVATES)}
                </Select.Option>
                <Select.Option value="on-behalf">
                  {t('labelRecordGrantingByAuthorizedPersons')}
                </Select.Option>
              </Select>
              {selectedGrantMode === 'on-behalf' && (
                <StyledIndentedRadioGroup
                  name="dataConsumer.on_behalf"
                  label={t('labelRecordAuthorizedPersonGrantMode')}
                  defaultValue={ActivationMode.ANY_ACTIVATOR_ACTIVATES}
                  required
                >
                  <Radio value={ActivationMode.ANY_ACTIVATOR_ACTIVATES}>
                    {t(ActivationMode.ANY_ACTIVATOR_ACTIVATES)}
                  </Radio>
                  <Radio value={ActivationMode.ALL_ACTIVATORS_ACTIVATE}>
                    {t(ActivationMode.ALL_ACTIVATORS_ACTIVATE)}
                  </Radio>
                </StyledIndentedRadioGroup>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

DataConsumerFormContent.propTypes = {
  dataConsumer: DataConsumerProp,
  extAPIsResponse: PropTypes.shape({
    ext_apis: PropTypes.objectOf(ExtAPIProp),
    metadatas: PropTypes.objectOf(MetadataProp),
  }),
  translationMetadatas: PropTypes.objectOf(MetadataProp),
};

DataConsumerFormContent.defaultProps = {
  dataConsumer: null,
  extAPIsResponse: null,
  translationMetadatas: null,
};

export default DataConsumerForm;

/* Helpers */

const REQUIRED_TRANSLATION_FIELDS = ['name', 'purpose', 'description', 'legal'];
const OPTIONAL_TRANSLATION_FIELDS = ['pre_cancellation', 'post_cancellation'];

/* Styled Components */

const StyledAlert = styled(Alert)`
  margin: 2em 0;
`;

const StyledIndentedRadioGroup = styled(Radio.Group)`
  margin-left: 1em;
`;
