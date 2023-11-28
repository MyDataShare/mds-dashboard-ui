import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import Button from 'components/button';
import Form from 'components/form';
import TextArea from 'components/text-area';
import UrlForm from 'components/url-form';
import { Model } from 'types/enums';

const AccessGatewayForm = ({
  accessGateway,
  urlMetadatas,
  mutationFn,
  invalidateQueries,
  onSuccess,
  onDeleteSuccess,
}) => {
  // TODO: When URL deleted / updated --> update also on DP
  const { t } = useTranslation();
  const history = useHistory();
  const agw = accessGateway || {};
  return (
    <Form
      mutationFn={(args) => mutationFn({ accessGateway, ...args })}
      invalidateQueries={invalidateQueries}
      onSuccess={onSuccess}
      onDeleteSuccess={onDeleteSuccess}
      onCancel={() => history.push('.')}
      submitLabel={accessGateway ? 'labelFormSubmit' : 'labelFormCreate'}
      includeDelete={!!accessGateway}
      deleteLabel="labelDeleteAccessGateway"
      deleteConfirmText={t('textConfirmDeleteAccessGateway', {
        accessGatewayName: accessGateway ? accessGateway.name : null,
      })}
      modelUuid={accessGateway ? accessGateway.uuid : null}
      modelName="access_gateway"
      otherActionsChildren={
        accessGateway ? (
          <>
            <h3>{t('headingRequestClient')}</h3>
            <p>{t('textRequestClientForAgw')}</p>
            <Button
              id="btn-request-client"
              text={t('labelRequestClient')}
              variant="secondary"
              size="small"
              to={`/clientRequest?type=access_gateway&access_gateway_uuid=${accessGateway.uuid}`}
            />
          </>
        ) : null
      }
    >
      <TextArea
        id="name"
        name="accessGateway.name"
        label={t('name')}
        value={agw.name}
        placeholder={agw.name}
        required
      />
      <TextArea
        id="description"
        name="accessGateway.description"
        label={t('description')}
        value={agw.description}
        placeholder={agw.description}
        rows={5}
        required
      />
      <h2 id="heading-urls">{t('headingAgwUrls')}</h2>
      <UrlForm
        urlMetadatas={urlMetadatas}
        addFieldsIfEmpty={!Object.keys(agw).length}
        urlTypes={URL_TYPES}
      />
    </Form>
  );
};

AccessGatewayForm.propTypes = {
  mutationFn: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  accessGateway: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  urlMetadatas: PropTypes.object,
  invalidateQueries: PropTypes.arrayOf(PropTypes.any),
  onSuccess: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func,
};

AccessGatewayForm.defaultProps = {
  accessGateway: null,
  urlMetadatas: {},
  invalidateQueries: [],
  onDeleteSuccess: null,
};

export default AccessGatewayForm;

/* Helpers */

const URL_TYPES = [Model.ACCESS_GATEWAY];
