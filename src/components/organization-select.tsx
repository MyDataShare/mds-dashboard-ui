import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router-dom';

import Alert from 'components/alert';
import Button from 'components/button';
import { useAuth } from 'context/auth';
import { stringToAlpha } from 'util/string';

// TODO: Move to pages?
const OrganizationSelect = () => {
  const { t } = useTranslation();
  const authCtx = useAuth(true);

  if (authCtx === undefined) {
    // Should not happen because of routing in App component.
    // But handle this anyway as a type guard, so that authCtx can't be
    // undefined below.
    // eslint-disable-next-line no-console
    console.error('useAuth unexpectedly returned undefined');
    throw new Error('errorGeneric');
  }

  if (authCtx.user.organizationIdentifiers.length === 1) {
    authCtx.selectOrganizationIdentifier(
      authCtx.user.organizationIdentifiers[0],
      false
    );
  }

  const { user } = authCtx;
  const hasOrganizations =
    user.organizationIdentifiers.length > 0 &&
    user.organizations !== undefined &&
    Object.keys(user.organizations).length > 0;

  return (
    <Switch>
      <Route exact path="/">
        <h1 id="heading-org-select">{t('headingSelectOrganization')}</h1>
        {hasOrganizations ? (
          <Button.Area vertical>
            {user.organizationIdentifiers.map((orgIdentifier) => {
              if (user.organizations === undefined) return null; // A little hand holding for TypeScript
              const org = user.organizations[orgIdentifier.organization_uuid];
              return (
                // TODO
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore: Button component not yet ported to TS
                <Button
                  id={`btn-org-select-${stringToAlpha(org.name)}`}
                  key={orgIdentifier.uuid}
                  text={org.name}
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    authCtx.selectOrganizationIdentifier(orgIdentifier, false)
                  }
                />
              );
            })}
          </Button.Area>
        ) : (
          <Alert id="alert-info-no-org" variant="info">
            <div>
              <div>{t('textNoOrganizationParagraph1')}</div>
              <div>{t('textNoOrganizationParagraph2')}</div>
            </div>
          </Alert>
        )}
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};

export default OrganizationSelect;
