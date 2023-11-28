import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteModel } from 'api';
import PropTypes from 'prop-types';
import React from 'react';
import { FormProvider, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Alert from 'components/alert';
import Button from 'components/button';
import ExitPrompt from 'components/exit-prompt';
import { Model } from 'types/enums';

const Form = ({
  cancelLabel,
  submitLabel,
  includeDelete,
  includeSuspend,
  isSuspended,
  deleteLabel,
  deleteConfirmText,
  modelUuid,
  modelName,
  serviceName,
  onCancel,
  mutationFn,
  invalidateQueries,
  onSuccess,
  onDeleteSuccess,
  otherActionsChildren,
  children,
}) => {
  const methods = useForm({ shouldUnregister: true });
  return (
    <FormProvider {...methods}>
      <FormContent
        cancelLabel={cancelLabel}
        submitLabel={submitLabel}
        includeDelete={includeDelete}
        includeSuspend={includeSuspend}
        isSuspended={isSuspended}
        deleteLabel={deleteLabel}
        deleteConfirmText={deleteConfirmText}
        modelUuid={modelUuid}
        modelName={modelName}
        serviceName={serviceName}
        onCancel={onCancel}
        mutationFn={mutationFn}
        invalidateQueries={invalidateQueries}
        onSuccess={onSuccess}
        onDeleteSuccess={onDeleteSuccess}
        methods={methods}
        otherActionsChildren={otherActionsChildren}
      >
        {children}
      </FormContent>
    </FormProvider>
  );
};

Form.propTypes = {
  children: PropTypes.node.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func,
  mutationFn: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  deleteLabel: PropTypes.string,
  deleteConfirmText: PropTypes.string,
  includeDelete: PropTypes.bool,
  includeSuspend: PropTypes.bool,
  isSuspended: PropTypes.bool,
  modelUuid: PropTypes.string,
  modelName: PropTypes.string,
  serviceName: PropTypes.string,
  otherActionsChildren: PropTypes.node,
};

Form.defaultProps = {
  onDeleteSuccess: () => null,
  onSuccess: () => null,
  submitLabel: 'labelFormSubmit',
  cancelLabel: 'labelFormCancel',
  deleteLabel: 'labelDelete',
  deleteConfirmText: 'textConfirmDelete',
  includeDelete: false,
  includeSuspend: false,
  isSuspended: false,
  modelUuid: null,
  modelName: null,
  serviceName: null,
  otherActionsChildren: null,
};

// TODO: Better way to add extra buttons, get rid of `includeDelete, includeSuspend`?
//       Form component now has too much information/dependencies outside the scope of form...

const FormContent = ({
  cancelLabel,
  submitLabel,
  includeDelete,
  includeSuspend,
  isSuspended,
  deleteLabel,
  deleteConfirmText,
  modelUuid,
  modelName,
  serviceName,
  onCancel,
  mutationFn,
  invalidateQueries,
  onSuccess,
  onDeleteSuccess,
  otherActionsChildren,
  children,
  methods,
}) => {
  const queryClient = useQueryClient();

  // Note on isDirty – React Hook Form seems to for some reason handle this differently in dev and
  // production modes. In production mode it works as it should, but in dev mode it seems to always
  // show false, except for when modifying inputs that have a listener (useWatch) and a defaultValue
  // specified in useWatch.
  // According to docs, for isDirty to work properly, we should specify defaultValues for all inputs
  // in the useForm call. We don't do this since it has been working without it previously, but even
  // if we do give defaultValues in useForm we still get the sticky false in dev.
  const { isDirty } = useFormState();

  const submit = useMutation(
    (payload) =>
      mutationFn({
        payload,
      }),
    {
      onSuccess: (data) => {
        if (invalidateQueries && invalidateQueries.length) {
          invalidateQueries.forEach((queryKey) =>
            queryClient.invalidateQueries(queryKey)
          );
        }
        return onSuccess(data);
      },
    }
  );
  const deleteMutation = useMutation(deleteModel, {
    onSuccess: () => {
      if (invalidateQueries && invalidateQueries.length) {
        invalidateQueries.forEach((queryKey) =>
          queryClient.invalidateQueries(queryKey)
        );
      }
      return onDeleteSuccess();
    },
  });
  const onDelete = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm(t(deleteConfirmText))) {
      deleteMutation.mutate({ uuid: modelUuid, model: modelName });
    }
  };
  const onSuspend = (suspend) => {
    const text = suspend ? 'suspendConfirmText' : 'unsuspendConfirmText';
    // eslint-disable-next-line no-alert
    if (window.confirm(t(text, { serviceName }))) {
      const payload = {};
      let payloadKey;
      if (modelName === Model.DATA_CONSUMER) {
        payloadKey = 'dataConsumer';
      } else if (modelName === Model.DATA_PROVIDER) {
        payloadKey = 'dataProvider';
      }
      if (!payloadKey) {
        throw new Error('errorGeneric');
      }
      payload[payloadKey] = { suspended: suspend };
      submit.mutate(payload);
    }
  };
  const { t } = useTranslation();
  return (
    <>
      <ExitPrompt />
      <StyledForm onSubmit={methods.handleSubmit(submit.mutate)}>
        {children}
        <Button.Area>
          {onCancel && (
            <Button
              id="btn-cancel"
              onClick={onCancel}
              type="button"
              text={t(cancelLabel)}
              variant="secondary"
            />
          )}
          <Button
            id="btn-submit"
            onClick={methods.handleSubmit(submit.mutate)}
            type="submit"
            text={t(submitLabel)}
            disabled={submit.isLoading || !isDirty}
          />
        </Button.Area>
        {(includeSuspend || includeDelete || otherActionsChildren) && (
          <>
            <hr />
            <h2>{t('headingOtherActions')}</h2>
            {otherActionsChildren}
            {includeSuspend && (
              <>
                <h3>
                  {isSuspended ? t('headingUnsuspend') : t('headingSuspend')}
                </h3>
                {isDirty && (
                  <StyledAlertWrapper>
                    <Alert id="alert-suspend-disabled" variant="info">
                      {t('textSuspensionDisabled')}
                    </Alert>
                  </StyledAlertWrapper>
                )}
                <p>{t('suspendServiceInfoParagraph1')}</p>
                <p>{t('suspendServiceInfoParagraph2')}</p>
                <div>
                  {isSuspended ? (
                    <Button
                      id="btn-unsuspend"
                      onClick={() => onSuspend(false)}
                      type="button"
                      text={t('labelUnsuspend')}
                      variant="secondary"
                      size="small"
                      disabled={isDirty}
                    />
                  ) : (
                    <Button
                      id="btn-suspend"
                      onClick={() => onSuspend(true)}
                      type="button"
                      text={t('labelSuspend')}
                      variant="secondary"
                      colorVariant="negative"
                      size="small"
                      disabled={isDirty}
                    />
                  )}
                </div>
              </>
            )}
            {includeDelete && (
              <>
                <h3>{t('headingDelete')}</h3>
                <p>{t('deleteServiceInfoParagraph1')}</p>
                <p>{t('deleteServiceInfoParagraph2')}</p>
                <Button
                  id="btn-delete"
                  onClick={onDelete}
                  type="button"
                  text={t(deleteLabel)}
                  variant="secondary"
                  colorVariant="negative"
                  size="small"
                />
              </>
            )}
          </>
        )}
      </StyledForm>
    </>
  );
};

FormContent.propTypes = Form.propTypes;
FormContent.defaultProps = Form.defaultProps;

export default Form;

/* Styled Components */

const StyledForm = styled.form`
  margin-top: 2em;
`;

const StyledAlertWrapper = styled.div`
  margin: 1.5em 0;
`;
