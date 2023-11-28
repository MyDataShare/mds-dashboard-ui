import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { createOrganizationIdentifier } from 'api/create';
import Breadcrumbs from 'components/breadcrumbs';
import Form from 'components/form';
import IdentifierInputs from 'components/identifier-inputs';
import Select from 'components/select';
import { useTitle } from 'hooks';
import { OrganizationIdentifierRole } from 'types/enums';

const UserCreate = () => {
  const { t } = useTranslation();
  const history = useHistory();
  useTitle('pageTitleUserCreate', t);
  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-add-user">{t('headingUserCreate')}</h1>
      <Form
        mutationFn={(args) => {
          const idType = args.payload.organizationIdentifier.identifier.type;
          if (idType === 'ssn__swe' || idType === 'ssn__fin') {
            // eslint-disable-next-line no-param-reassign
            args.payload.organizationIdentifier.identifier.type = 'ssn';
          }
          return createOrganizationIdentifier(args);
        }}
        onSuccess={() => history.replace('.')}
        onCancel={() => history.replace('.')}
        invalidateQueries={['organizationIdentifiers']}
      >
        <IdentifierInputs namePrefix="organizationIdentifier" />
        <Select
          label={t('labelRole')}
          name="organizationIdentifier.role"
          id="organizationIdentifier.role"
          defaultValue={ROLES[0]}
          required
        >
          {ROLES.map((role) => (
            <Select.Option key={role} value={role}>
              {t(role)}
            </Select.Option>
          ))}
        </Select>
      </Form>
    </>
  );
};

export default UserCreate;

/* Helpers */

const ROLES = [
  OrganizationIdentifierRole.USER,
  OrganizationIdentifierRole.ADMIN,
];
