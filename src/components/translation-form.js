import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/button';
import Dropdown from 'components/dropdown';
import TextArea from 'components/text-area';
import { Model } from 'types/enums';

const SUPPORTED_LANGUAGES = ['fin', 'eng', 'swe'];

const TranslationForm = ({
  requiredFields,
  optionalFields,
  translationMetadatas,
}) => {
  const { getValues, setValue } = useFormContext();
  const [originalTranslations] = React.useState(
    translationMetadatas && Object.keys(translationMetadatas).length
      ? Object.values(translationMetadatas)
      : []
  );
  const { fields, append, remove, replace } = useFieldArray({
    name: 'translations',
  });

  // TODO: de-effect? can we set fieldarray values during init instead of side effect?
  React.useEffect(() => {
    const formValues = originalTranslations.map((meta) => ({
      language: meta.subtype1,
      values: meta.json_data,
    }));
    replace(formValues);
  }, [originalTranslations, replace]);

  const { t } = useTranslation();

  const addTranslation = (language) => {
    // When a new translation fieldset is added, check if a translation for this language already
    // exists. If it does, it means that the user had intended to delete the translation for this
    // language by clicking the delete icon, but now they re-added translation fields for this
    // language. We should remove the information that translations for this language are deleted,
    // so that instead of issuing a DELETE and a POST request for first deleting the translation
    // and then re-creating it, we will instead PATCH the existing one.
    const formDeleted = getValues('deleted');
    const existingTranslation = originalTranslations.find(
      (meta) => meta.subtype1 === language
    );
    if (Array.isArray(formDeleted) && existingTranslation) {
      // Translations for this language were first deleted, and now re-added. Remove the deletion
      // instruction from form values.
      const previouslyDeleted = formDeleted.find(
        ([modelName, uuid]) =>
          modelName === Model.METADATA && uuid === existingTranslation.uuid
      );
      if (previouslyDeleted) {
        setValue(
          'deleted',
          formDeleted.filter((deletedData) => deletedData !== previouslyDeleted)
        );
      }
    }
    append({ language, values: {} });
  };

  const setTranslationDeleted = (language) => {
    // When the delete icon for a translation is clicked, save the UUID of the translation to
    // delete so that we can issue a DELETE request when the form is submitted.
    const existingTranslation = originalTranslations.find(
      (meta) => meta.subtype1 === language
    );
    if (!existingTranslation) {
      // This translation fieldset was new and not pre-existing, so we don't need to do anything
      return;
    }
    const formDeleted = getValues('deleted');
    if (formDeleted === undefined) {
      setValue('deleted', [[Model.METADATA, existingTranslation.uuid]]);
    } else if (Array.isArray(formDeleted)) {
      const alreadyDeleted = formDeleted.find(
        ([modelName, uuid]) =>
          modelName === Model.METADATA && uuid === existingTranslation.uuid
      );
      if (!alreadyDeleted) {
        setValue('deleted', [
          ...formDeleted,
          [Model.METADATA, existingTranslation.uuid],
        ]);
      }
    }
  };

  const onDeleteLanguage = (translationIndex) => {
    const { language } = fields[translationIndex];
    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        t('textConfirmDeleteTranslations', { language: t(language) })
      )
    ) {
      remove(translationIndex);
      setTranslationDeleted(language);
    }
  };
  const translatedLanguages = fields.map(({ language }) => language);
  return (
    <>
      {fields.map(({ id, language, values }, index) => (
        <FieldSet
          key={id}
          index={index}
          requiredFields={requiredFields}
          optionalFields={optionalFields}
          language={language}
          values={values}
          onDeleteLanguage={() => onDeleteLanguage(index)}
        />
      ))}
      {translatedLanguages.length === 0 && (
        <p id="text-no-localizations">
          <i>{t('textNoLocalizations')}</i>
        </p>
      )}
      <StyledButtonWrapper>
        {Object.keys(fields).length < SUPPORTED_LANGUAGES.length ? (
          <Dropdown
            text={t('labelAddLocalization')}
            id="dropdown-add-localization"
            icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
            useTextButton
          >
            {SUPPORTED_LANGUAGES.reduce((acc, cur) => {
              if (!translatedLanguages.includes(cur)) {
                acc.push(
                  <Dropdown.Item
                    id={`btn-add-localization-${cur}`}
                    key={cur}
                    text={t(cur)}
                    onClick={() => addTranslation(cur)}
                  />
                );
              }
              return acc;
            }, [])}
          </Dropdown>
        ) : (
          <i id="text-all-localizations-added">
            {t('textAllTranslationsAdded')}
          </i>
        )}
      </StyledButtonWrapper>
    </>
  );
};

TranslationForm.propTypes = {
  requiredFields: PropTypes.arrayOf(PropTypes.string),
  optionalFields: PropTypes.arrayOf(PropTypes.string),
  translationMetadatas: PropTypes.shape({
    lang: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    tr: PropTypes.object,
  }),
};

TranslationForm.defaultProps = {
  requiredFields: [],
  optionalFields: [],
  translationMetadatas: {},
};

export default TranslationForm;

/* Helpers */

const FieldSet = ({
  index,
  requiredFields,
  optionalFields,
  values,
  language,
  onDeleteLanguage,
}) => {
  const { t } = useTranslation();
  return (
    <StyledFieldSet>
      <StyledTranslationHeadingWrapper>
        <legend>
          <h3>{t(language)}</h3>
        </legend>
        <Button
          id={`btn-delete-localization-${language}`}
          type="button"
          variant="text"
          text={t('labelDelete')}
          onClick={onDeleteLanguage}
          colorVariant="negative"
          icon={<FontAwesomeIcon icon={icon({ name: 'trash' })} />}
        />
      </StyledTranslationHeadingWrapper>
      <input
        hidden
        type="hidden"
        value={language}
        name={`translations.${index}.language`}
      />
      {requiredFields &&
        requiredFields.map((field) => {
          const fieldName = `translations.${index}.values.${field}`;
          const val = values && field in values ? values[field] : null;
          return (
            <TextArea
              id={`input-${field}-${language}`}
              key={fieldName}
              name={fieldName}
              label={t(field)}
              required
              value={val}
              placeholder={val}
            />
          );
        })}
      {optionalFields &&
        optionalFields.map((field) => {
          const fieldName = `translations.${index}.values.${field}`;
          const val = values && field in values ? values[field] : null;
          return (
            <TextArea
              key={fieldName}
              id={fieldName}
              name={fieldName}
              label={t(field)}
              value={val}
              placeholder={val}
            />
          );
        })}
    </StyledFieldSet>
  );
};

FieldSet.propTypes = {
  index: PropTypes.number.isRequired,
  language: PropTypes.string.isRequired,
  onDeleteLanguage: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  requiredFields: PropTypes.arrayOf(PropTypes.string),
  optionalFields: PropTypes.arrayOf(PropTypes.string),
};

FieldSet.defaultProps = {
  requiredFields: [],
  optionalFields: [],
};

/* Styled Components */

const StyledFieldSet = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
`;

const StyledTranslationHeadingWrapper = styled.div`
  * {
    justify-content: flex-end;
  }
  display: flex;
  align-items: center;
  justify-content: space-between;
  h3 {
    margin: 0;
  }
  margin: 4em 0 0.5em 0;
  line-height: 1.1;
`;

const StyledButtonWrapper = styled.div`
  margin-top: 2em;
`;
