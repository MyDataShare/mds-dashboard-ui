import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useInfiniteQuery } from '@tanstack/react-query';
import { combinePaginatedResponses } from 'mydatashare-core';
import PropTypes from 'prop-types';
import React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { createSupportRequest } from 'api/create';
import { fetchOrganizationIds } from 'api/search';
import Alert from 'components/alert';
import AnnouncingLink from 'components/announcing-link';
import Button from 'components/button';
import Checkbox from 'components/checkbox';
import Form from 'components/form';
import Input from 'components/input';
import Loading from 'components/loading';
import RequesterInputs from 'components/requester-inputs';
import Select from 'components/select';
import { useTitle } from 'hooks';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { flatten } from 'util/form';
import {
  VALIDATE_NON_WHITESPACE,
  VALIDATE_REG_NUM_FIN,
  VALIDATE_REG_NUM_SWE,
} from 'util/validation';

const COUNTRIES = ['FIN', 'SWE'];

const LEGAL_ENTITY_TYPES = {
  FIN: [
    'Osakeyhtiö',
    'Osuuskunta',
    'Asunto-osakeyhtiö',
    'Kunnallinen liikelaitos',
    'Säätiö',
    'Valtion liikelaitos',
    'Kommandiittiyhtiö',
  ],
  SWE: ['Aktiebolag', 'Handelsbolag', 'Kommanditbolag', 'Enkla bolag'],
};

const OrganizationRequest = () => {
  const [success, setSuccess] = React.useState(false);
  const { t } = useTranslation();
  const history = useHistory();
  useTitle('pageTitleOrganizationRequest', t);
  return (
    <>
      <h1 id="heading-org-request">{t('headingOrganizationRequest')}</h1>
      {success ? (
        <div>
          <p id="text-org-request-sent">{t('textOrganizationRequestSent')}</p>
          <AnnouncingLink id="link-back-home" to="/">
            {t('labelBackHome')}
          </AnnouncingLink>
        </div>
      ) : (
        <Form
          onCancel={() => history.push('.')}
          onSuccess={() => setSuccess(true)}
          mutationFn={(args) => {
            // eslint-disable-next-line no-param-reassign
            args.payload.data = flatten(args.payload.data);
            const key = 'existing_organization_ids.uuid';
            if (!Array.isArray(args.payload.data[key])) {
              if (typeof args.payload.data[key] === 'string') {
                // One existing org_id is selected, convert to list
                // eslint-disable-next-line no-param-reassign
                args.payload.data[key] = [args.payload.data[key]];
              } else {
                // No existing org_id is selected, convert to empty list
                // eslint-disable-next-line no-param-reassign
                args.payload.data[key] = [];
              }
            }

            // Legal entity type inputs have country info in names, strip them out
            COUNTRIES.forEach((country) => {
              if (`legal_entity_type_${country}` in args.payload.data) {
                // eslint-disable-next-line no-param-reassign
                args.payload.data.legal_entity_type =
                  args.payload.data[`legal_entity_type_${country}`];
                // eslint-disable-next-line no-param-reassign
                delete args.payload.data[`legal_entity_type_${country}`];
              }
              if (`legal_entity_type_other_${country}` in args.payload.data) {
                // eslint-disable-next-line no-param-reassign
                args.payload.data.legal_entity_type_other =
                  args.payload.data[`legal_entity_type_other_${country}`];
                // eslint-disable-next-line no-param-reassign
                delete args.payload.data[`legal_entity_type_other_${country}`];
              }
            });

            return createSupportRequest(args);
          }}
          submitLabel={t('labelSend')}
        >
          <OrganizationRequestFormContent />
        </Form>
      )}
    </>
  );
};

const OrganizationRequestFormContent = () => {
  const { t } = useTranslation();
  const { getValues } = useFormContext();
  const defaultOrgIdType = 'registration_number';
  const defaultCountry = 'FIN';

  const selectedCountry = useWatch({
    name: 'data.country',
    defaultValue: defaultCountry,
  });

  const { fields, append, remove, replace } = useFieldArray({
    name: 'data.organization_ids',
  });

  const {
    data,
    isError,
    isLoading,
    isSuccess,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['organizationIds'],
    queryFn: fetchOrganizationIds,
  });
  if (!isLoading && !isFetchingNextPage && hasNextPage) {
    fetchNextPage();
  }

  React.useEffect(() => {
    // If we don't have any existing organization_ids (we should though), show one
    // empty input set for a new organization_id.
    if (
      isSuccess &&
      data.pages &&
      data.pages.length &&
      (data.pages[0].results === 0 || !('results' in data.pages[0]))
    ) {
      replace([
        {
          org_id_country: defaultCountry,
          org_id_type: defaultOrgIdType,
          org_id_value: '',
        },
      ]);
    }
  }, [data, isSuccess, replace]);

  if (isLoading || isFetchingNextPage) {
    return <Loading />;
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const combinedData = data.pages ? combinePaginatedResponses(data.pages) : {};
  const organizationIds = data.pages
    ? Object.values(combinedData.organization_ids)
    : [];

  // TODO: Require at least one organization_id (existing or new) in form validation

  /* TODO:
        Legal entity inputs are handled suboptimally, with the input names containing
        the country information too. This was done because the options in legal entity
        select are changed according to the selected country, and if the legal entity
        select has a persistent input name, synchronizing the currently selected value
        in React Hook Form seems cumbersome.
        This way (and with mounting/unmounting LegalEntityInputs according to country)
        we achieve the desired behavior without incorporating more state handling and
        controlled inputs.
   */
  return (
    <StyledPageWrapper>
      <Input
        id="organizationNameInput"
        name="data.name"
        label={t('labelOrganizationName')}
        required
      />
      <Input
        id="organizationDescriptionInput"
        name="data.description"
        label={t('labelOrganizationDescription')}
        required
      />
      <Select
        id="organizationCountrySelect"
        name="data.country"
        label={t('country')}
        defaultValue={defaultCountry}
        required
      >
        {COUNTRIES.map((country) => (
          <Select.Option key={country} value={country}>
            {t(country)}
          </Select.Option>
        ))}
      </Select>
      {selectedCountry === 'FIN' && <LegalEntityInputs country="FIN" />}
      {selectedCountry === 'SWE' && <LegalEntityInputs country="SWE" />}

      <Select
        id="organizationDefaultLanguageSelect"
        name="data.default_language"
        label={t('default_language')}
        required
      >
        <Select.Option value="fin">{t('fin')}</Select.Option>
        <Select.Option value="eng">{t('eng')}</Select.Option>
        <Select.Option value="swe">{t('swe')}</Select.Option>
      </Select>

      <h2>{t('headingOrgIds')}</h2>
      {organizationIds.length > 0 && <p>{t('textSelectExistingOrgIds')}</p>}
      {organizationIds.map((orgId, index) => {
        let validation = {};
        if (index === 0) {
          // Validate at least one org ID is present in form.
          // It can either be an existing one or a new one.
          // If we have existing org IDs, show the error on the
          // first checkbox.
          // If we don't have existing org IDs, we don't need to validate
          // anything as the user is required to fill in at least one org ID.
          validation = {
            validate: () => {
              const { data: values } = getValues();
              const noExistingGovIdSelected =
                values.existing_organization_ids &&
                values.existing_organization_ids &&
                values.existing_organization_ids.uuid === false;
              const noNewOrgId = values.organization_ids.length === 0;
              return !(noExistingGovIdSelected && noNewOrgId)
                ? true
                : 'errorValidationGovIdRequired';
            },
          };
        }
        return (
          <Checkbox
            id={`data.existing_organization_ids.${index}`}
            key={orgId.uuid}
            name="data.existing_organization_ids.uuid"
            value={orgId.uuid}
            checked
            required
            options={validation}
          >
            <b>{orgId.org_id_value}</b>{' '}
            {`(${t(orgId.org_id_type)}, ${t(orgId.org_id_country)})`}
          </Checkbox>
        );
      })}
      {fields.map((formValues, index) => (
        <OrganizationIdInputs
          key={formValues.id}
          onRemove={() => remove(index)}
          index={index}
          defaultOrgIdType={defaultOrgIdType}
          defaultCountry={defaultCountry}
          showDeleteButton={fields.length > 1 || organizationIds.length > 0}
        />
      ))}
      <StyledButtonWrapper>
        <Button
          id="btn-add-org-id"
          type="button"
          text={t('labelAddOrganizationId')}
          variant="text"
          icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
          onClick={() =>
            append({
              org_id_type: defaultOrgIdType,
              org_id_country: defaultCountry,
              org_id_value: '',
            })
          }
        />
      </StyledButtonWrapper>
      <StyledAlertWrapper>
        <Alert id="alert-org-id-required" variant="info">
          {t('textRequiredOrgIdInfo')}
        </Alert>
      </StyledAlertWrapper>

      <RequesterInputs />
      <StyledAlertWrapper>
        <Alert id="alert-client-request-info" variant="info">
          {t('textClientRequestInfoAlert')}
        </Alert>
      </StyledAlertWrapper>
    </StyledPageWrapper>
  );
};

const LegalEntityInputs = ({ country }) => {
  const { t } = useTranslation();
  const defaultLegalEntityType = LEGAL_ENTITY_TYPES[country][0];
  const selectedLegalEntityType = useWatch({
    name: `data.legal_entity_type_${country}`,
    defaultValue: defaultLegalEntityType,
  });
  return (
    <>
      <Select
        id={`organizationLegalEntitySelect${country}`}
        name={`data.legal_entity_type_${country}`}
        label={t('legal_entity_type')}
        defaultValue={defaultLegalEntityType}
        value={selectedLegalEntityType}
        required
      >
        {LEGAL_ENTITY_TYPES[country].map((legalEntityType) => (
          <Select.Option key={legalEntityType} value={legalEntityType}>
            {t(legalEntityType)}
          </Select.Option>
        ))}
        <Select.Option value="other">{t('labelOther')}</Select.Option>
      </Select>
      {selectedLegalEntityType === 'other' && (
        <Input
          id={`organizationLegalEntityInput${country}`}
          name={`data.legal_entity_type_other_${country}`}
          label={t('legal_entity_type_other')}
          required
        />
      )}
    </>
  );
};

LegalEntityInputs.propTypes = {
  country: PropTypes.oneOf(COUNTRIES).isRequired,
};

const OrganizationIdInputs = ({
  index,
  onRemove,
  defaultOrgIdType,
  defaultCountry,
  showDeleteButton,
}) => {
  const { t } = useTranslation();
  const selectedOrgIdType = useWatch({
    name: `data.organization_ids.${index}.org_id_type`,
    defaultValue: defaultOrgIdType,
  });
  const selectedCountry = useWatch({
    name: `data.organization_ids.${index}.org_id_country`,
    defaultValue: defaultCountry,
  });
  return (
    <StyledOrgIdInputsWrapper>
      <StyledInlineButtonWrapper>
        <Select
          id={`organizationOrgIds.${index}.countrySelect`}
          name={`data.organization_ids.${index}.org_id_country`}
          label={t('country')}
          defaultValue={defaultCountry}
          required
        >
          {COUNTRIES.map((c) => (
            <Select.Option key={c} value={c}>
              {t(c)}
            </Select.Option>
          ))}
        </Select>
        {showDeleteButton && (
          <Button
            id={`organizationOrgIds.${index}.btn-delete`}
            type="button"
            variant="text"
            text={t('labelDelete')}
            onClick={onRemove}
            colorVariant="negative"
            icon={<FontAwesomeIcon icon={icon({ name: 'trash' })} />}
          />
        )}
      </StyledInlineButtonWrapper>
      <Select
        id={`organizationOrgIds.${index}.orgIdTypeSelect`}
        name={`data.organization_ids.${index}.org_id_type`}
        label={t('org_id_type')}
        defaultValue={defaultOrgIdType}
        required
      >
        <Select.Option value="registration_number">
          {t(`registration_number_${selectedCountry}`)}
        </Select.Option>
        <Select.Option value="other">{t('labelOther')}</Select.Option>
      </Select>
      {selectedOrgIdType === 'other' && (
        <Input
          id={`organizationOrgIds.${index}.orgIdTypeInput`}
          name={`data.organization_ids.${index}.org_id_type_other`}
          label={t('org_id_type_other')}
          required
        />
      )}
      <Input
        id={`organizationOrgIds.${index}.orgIdValueInput`}
        name={`data.organization_ids.${index}.org_id_value`}
        label={t('org_id_value')}
        options={ORG_ID_VALIDATIONS[selectedCountry][selectedOrgIdType]}
        required
      />
    </StyledOrgIdInputsWrapper>
  );
};

OrganizationIdInputs.propTypes = {
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  defaultOrgIdType: PropTypes.string.isRequired,
  defaultCountry: PropTypes.string.isRequired,
  showDeleteButton: PropTypes.bool.isRequired,
};

export default OrganizationRequest;

/* Helpers */

const ORG_ID_VALIDATIONS = {
  FIN: {
    registration_number: VALIDATE_REG_NUM_FIN,
    other: VALIDATE_NON_WHITESPACE,
  },
  SWE: {
    registration_number: VALIDATE_REG_NUM_SWE,
    other: VALIDATE_NON_WHITESPACE,
  },
};

/* Styled Components */

const StyledOrgIdInputsWrapper = styled.div``;

const StyledPageWrapper = styled.div`
  ${StyledOrgIdInputsWrapper} + ${StyledOrgIdInputsWrapper} {
    margin-top: 4em;
  }
`;

const StyledInlineButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    margin: 2.75em 0 0 2em;
  }
`;

const StyledButtonWrapper = styled.div`
  margin: 1em 0 3.5em 0;
`;

const StyledAlertWrapper = styled.div`
  margin: 1.5em 0;
`;
