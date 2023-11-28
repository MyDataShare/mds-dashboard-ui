import { Organization, OrganizationIdentifier } from 'types/api-objects';

export const addToStorage = (name: string, value: string) => {
  localStorage.setItem(name, value);
};

export const getFromStorage = (name: string): string | null =>
  localStorage.getItem(name);

export const removeFromStorage = (name: string) =>
  localStorage.removeItem(name);

type StorageUser = {
  token: string;
  idToken: string;
  identifierUuid: string | null;
  organizationIdentifier?: OrganizationIdentifier;
  organization?: Organization;
  organizations?: Record<string, Organization>;
};

type AssertedUser = {
  token: string;
  idToken: string;
  identifierUuid: string;
  organizationIdentifier: OrganizationIdentifier;
  organization: Organization;
  organizations: Record<string, Organization>;
};

export const addUserToStorage = ({
  token,
  idToken,
  identifierUuid,
  organizationIdentifier,
  organization,
  organizations,
}: StorageUser) => {
  addToStorage('access_token', token);
  addToStorage('id_token', idToken);
  if (identifierUuid) {
    addToStorage('identifier_uuid', identifierUuid);
  }
  if (organizationIdentifier) {
    addToStorage(
      'organization_identifier',
      JSON.stringify(organizationIdentifier)
    );
  }
  if (organizations) {
    addToStorage('organizations', JSON.stringify(organizations));
  }
  if (organization) {
    addToStorage('organization', JSON.stringify(organization));
  }
};

function getJsonFromStorage<T>(name: string): T | null {
  const strValue = getFromStorage(name);
  if (strValue && strValue.length) {
    return JSON.parse(strValue) as T;
  }
  return null;
}

export const getLoggedInUserFromStorage = (): AssertedUser => {
  const user = getUserFromStorage();
  if (Object.values(user).some((v) => !v)) {
    removeUserFromStorage();
    // eslint-disable-next-line no-console
    console.error('Asserting logged in user, some required values missing');
    throw new Error('errorGeneric');
  }
  return user as AssertedUser;
};

export const getUserFromStorage = () => {
  const organizations =
    getJsonFromStorage<Record<string, Organization>>('organizations');
  const organizationIdentifier = getJsonFromStorage<OrganizationIdentifier>(
    'organization_identifier'
  );
  const organization = getJsonFromStorage<Organization>('organization');
  return {
    token: getFromStorage('access_token'),
    idToken: getFromStorage('id_token'),
    organizationIdentifier,
    identifierUuid: getFromStorage('identifier_uuid'),
    organizations,
    organization,
  };
};

export const removeUserFromStorage = () => {
  removeFromStorage('access_token');
  removeFromStorage('id_token');
  removeFromStorage('organization_identifier');
  removeFromStorage('identifier_uuid');
  removeFromStorage('organizations');
  removeFromStorage('organization');

  // These are legacy, and not anymore saved to localStorage, but keep their removal so that
  // no data is left on any browser memory. Don't remove these!
  removeFromStorage('given_name');
  removeFromStorage('family_name');
  removeFromStorage('username');
  removeFromStorage('identifiers');
  removeFromStorage('identifier');
  removeFromStorage('metadatas');
  removeFromStorage('organization_identifiers');
};
