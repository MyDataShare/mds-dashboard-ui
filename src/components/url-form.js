import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/button';
import Input from 'components/input';
import Select from 'components/select';
import { Model } from 'types/enums';

const EMPTY_URL_FORM = {
  name: null,
  json_data: {},
  uuid: null,
};

const UrlForm = ({ urlMetadatas, addFieldsIfEmpty, urlTypes }) => {
  const { getValues, setValue } = useFormContext();
  const [originalUrls] = React.useState(
    // eslint-disable-next-line no-nested-ternary
    Object.keys(urlMetadatas).length
      ? Object.values(urlMetadatas)
      : addFieldsIfEmpty
        ? [EMPTY_URL_FORM]
        : []
  );
  const { fields, append, remove, replace } = useFieldArray({ name: 'urls' });

  // TODO: possibly de-effect, same as translationform
  React.useEffect(() => {
    const formValues = originalUrls.map((meta) =>
      Object.values(meta).length
        ? {
            name: meta.name,
            url: meta.json_data.url,
            method_type: meta.json_data.method_type,
            url_type: meta.json_data.url_type,
            uuid: meta.uuid,
          }
        : EMPTY_URL_FORM
    );
    replace(formValues);
  }, [replace, originalUrls]);
  const { t } = useTranslation();

  const setUrlDeleted = (urlUuid) => {
    // When the delete icon for a url is clicked, save the UUID of the url to delete
    // so that we can issue a DELETE request when the form is submitted.
    const formDeleted = getValues('deleted');
    if (formDeleted === undefined) {
      setValue('deleted', [[Model.METADATA, urlUuid]]);
    } else if (Array.isArray(formDeleted)) {
      const alreadyDeleted = formDeleted.find(
        ([modelName, uuid]) => modelName === Model.METADATA && uuid === urlUuid
      );
      if (!alreadyDeleted) {
        setValue('deleted', [...formDeleted, [Model.METADATA, urlUuid]]);
      }
    }
  };

  const onDeleteUrl = (urlIndex) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(t('textConfirmDeleteUrl'))) {
      const urlUuid = fields[urlIndex].uuid;
      remove(urlIndex);
      if (urlUuid) {
        setUrlDeleted(urlUuid);
      }
    }
  };

  return (
    <StyledWrapper>
      {fields.map((formValues, index) => (
        <FieldSet
          key={formValues.id}
          index={index}
          name={formValues.name}
          url={formValues.url}
          methodType={formValues.method_type}
          urlType={formValues.url_type}
          urlTypes={urlTypes}
          uuid={formValues.uuid}
          onDeleteUrl={onDeleteUrl}
        />
      ))}
      <StyledButtonWrapper>
        <Button
          id="btn-add-url"
          type="button"
          text={t('labelAddUrl')}
          variant="text"
          icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
          onClick={() => append(EMPTY_URL_FORM)}
        />
      </StyledButtonWrapper>
    </StyledWrapper>
  );
};

UrlForm.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  urlMetadatas: PropTypes.object,
  addFieldsIfEmpty: PropTypes.bool,
  urlTypes: PropTypes.arrayOf(PropTypes.string),
};

UrlForm.defaultProps = {
  urlMetadatas: {},
  addFieldsIfEmpty: false,
  urlTypes: [Model.ACCESS_GATEWAY],
};

export default UrlForm;

/* Helpers */

const URL_METHOD_TYPES = ['get', 'post', 'put', 'patch', 'delete'];

const FieldSet = ({
  index,
  onDeleteUrl,
  uuid,
  name,
  url,
  methodType,
  urlType,
  urlTypes,
}) => {
  let lowerCaseMethodType = methodType;
  if (methodType) {
    lowerCaseMethodType = methodType.toLowerCase();
  }
  const { t } = useTranslation();
  return (
    <StyledFieldSetWrapper>
      <StyledFieldSet>
        {uuid && (
          <Input
            hidden
            type="hidden"
            value={uuid}
            name={`urls.${index}.uuid`}
            id={`urls.${index}.uuid`}
          />
        )}
        <Select
          hidden={urlTypes.length === 1}
          label={t('url_type')}
          name={`urls.${index}.url_type`}
          id={`urls.${index}.url_type`}
          defaultValue={urlType || urlTypes[0]}
          required
        >
          {urlTypes.map((urlType_) => (
            <Select.Option key={urlType_} value={urlType_}>
              {t(urlType_)}
            </Select.Option>
          ))}
        </Select>
        <Input
          label={t('name')}
          name={`urls.${index}.name`}
          id={`urls.${index}.name`}
          value={name}
          placeholder={name}
          required
        />
        <Input
          type="url"
          label={t('url')}
          name={`urls.${index}.url`}
          id={`urls.${index}.url`}
          value={url}
          placeholder={url}
          required
        />
        <Select
          label={t('method_type')}
          name={`urls.${index}.method_type`}
          id={`urls.${index}.method_type`}
          defaultValue={lowerCaseMethodType || URL_METHOD_TYPES[0]}
          required
        >
          {URL_METHOD_TYPES.map((mType) => (
            <Select.Option key={mType} value={mType}>
              {mType.toUpperCase()}
            </Select.Option>
          ))}
        </Select>
      </StyledFieldSet>
      <Button
        id={`urls.${index}.btn-delete`}
        type="button"
        variant="text"
        text={t('labelDelete')}
        onClick={() => onDeleteUrl(index)}
        colorVariant="negative"
        icon={<FontAwesomeIcon icon={icon({ name: 'trash' })} />}
      />
    </StyledFieldSetWrapper>
  );
};

FieldSet.propTypes = {
  index: PropTypes.number.isRequired,
  onDeleteUrl: PropTypes.func.isRequired,
  uuid: PropTypes.string,
  name: PropTypes.string,
  url: PropTypes.string,
  methodType: PropTypes.oneOf(URL_METHOD_TYPES),
  urlType: PropTypes.oneOf([Model.ACCESS_GATEWAY]),
  urlTypes: PropTypes.arrayOf(PropTypes.oneOf([Model.ACCESS_GATEWAY])),
};

FieldSet.defaultProps = {
  uuid: null,
  name: null,
  url: null,
  methodType: null,
  urlType: null,
  urlTypes: [],
};

/* Styled Components */

const StyledFieldSetWrapper = styled.div`
  display: flex;
  button {
    margin: 0.625em 0 0 2em;
  }
`;

const StyledFieldSet = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const StyledWrapper = styled.div`
  ${StyledFieldSetWrapper} + ${StyledFieldSetWrapper} {
    margin-top: 3em;
  }
`;

const StyledButtonWrapper = styled.div`
  margin-top: 2em;
`;
