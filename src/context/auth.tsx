import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizationCallback, endSession } from 'mydatashare-core';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';

import Loading from 'components/loading';
import { User, UserPartial } from 'types';
import { Organization, OrganizationIdentifier } from 'types/api-objects';
import { IdentifiersResponse } from 'types/api-responses';
import { Method } from 'types/enums';
import client from 'util/client';
import {
  CLIENT_ID,
  ENDPOINT_IDENTIFIERS,
  POST_LOGOUT_REDIRECT_URI,
  REDIRECT_URI,
} from 'util/constants';
import { formatUsername, getUsername } from 'util/mds-api';
import {
  addUserToStorage,
  getUserFromStorage,
  removeUserFromStorage,
} from 'util/storage';

interface AuthContextTypePartial {
  user: UserPartial;
  logout: () => void;
  selectOrganizationIdentifier: (
    organizationIdentifier: OrganizationIdentifier,
    confirm?: boolean
  ) => void;
}

interface AuthContextType extends AuthContextTypePartial {
  user: User;
}

const AuthContext = createContext<
  AuthContextType | AuthContextTypePartial | undefined
>(undefined);

const fetchIdentifiers = async (): Promise<UserPartial | null> => {
  // TODO: Translations for the selected organization?
  // TODO: Log out user if no org affiliations, and user is logged in
  const savedUser = getUserFromStorage();
  if (savedUser.token === null || savedUser.idToken === null) {
    return null;
  }
  const savedToken: string = savedUser.token;
  const savedIdToken: string = savedUser.idToken;
  let user: UserPartial | null = null;
  const resp: IdentifiersResponse = await client(ENDPOINT_IDENTIFIERS, {
    method: Method.POST,
    addQueryParams: false,
    isPaginated: true,
    fetchAll: true,
  });

  const organizationIdentifiers = resp.organization_identifiers
    ? Object.values(resp.organization_identifiers).filter(
        (oi: OrganizationIdentifier) => !!oi.organization_uuid
      )
    : [];
  const { organizations, metadatas } = resp;
  const { givenName, familyName } = getUsername(resp);
  const username = formatUsername({ givenName, familyName });
  let organization: Organization | undefined;
  let organizationIdentifier: OrganizationIdentifier | undefined;
  let identifierUuid: string | null = null;
  const savedOrganization = savedUser.organization;
  if (organizationIdentifiers.length === 1) {
    // eslint-disable-next-line prefer-destructuring
    organizationIdentifier = organizationIdentifiers[0];
    organization =
      resp.organizations[organizationIdentifiers[0].organization_uuid];
    identifierUuid = organizationIdentifiers[0].identifier_uuid;
  } else if (organizationIdentifiers.length > 1 && savedOrganization !== null) {
    organizationIdentifier = organizationIdentifiers.find(
      (orgIdent: OrganizationIdentifier) =>
        orgIdent.organization_uuid === savedOrganization.uuid &&
        orgIdent.identifier_uuid === savedUser.identifierUuid
    );
    if (organizationIdentifier) {
      identifierUuid = savedUser.identifierUuid;
      organization =
        resp.organizations[organizationIdentifier.organization_uuid];
    }
  }
  user = {
    token: savedToken,
    idToken: savedIdToken,
    givenName,
    familyName,
    username,
    identifierUuid,
    metadatas,
    organization,
    organizations,
    organizationIdentifier,
    organizationIdentifiers,
  };
  addUserToStorage(user);
  return user;
};

const LoginCallback = () => {
  const history = useHistory();
  const { refetch } = useQuery({
    queryKey: ['user'],
    queryFn: fetchIdentifiers,
    enabled: false,
  });
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const authCallback = async () => {
      try {
        // Try to perform token request with info from URL (code etc.)
        const { accessToken, idToken } = await authorizationCallback(
          CLIENT_ID,
          REDIRECT_URI
        );
        // Nonce validation and token request succeeded, save user info to localStorage
        addUserToStorage({
          token: accessToken,
          idToken,
          identifierUuid: null,
        });
        // Fetch the MDS Identifiers endpoint to get hold of organization affiliations and usernames
        await refetch();
        history.push('/');
      } catch (e) {
        // We get an error e.g. if nonce validation failed. MDS Core authorizationCallback takes
        // the expected nonce from localStorage and removes it after validation. So if we call
        // authorizationCallback multiple times in a row, the subsequent calls will fail.
        // This most commonly occurs in development mode because we have React strict mode enabled.
        // Strict mode mounts all components twice to sniff out side effect bugs; this means all
        // useEffect calls will be called at least twice even if the effect dependencies stay
        // the same.
        // To not crash on this error, we check if we already have token in localStorage, which
        // means that we have already gone through auth successfully. In this case just ignore the
        // error from MDS Core.
        const { token } = getUserFromStorage();
        if (!token) {
          setIsError(true);
        }
      }
    };

    authCallback();
  }, [history, refetch, isError]);

  if (isError) {
    throw new Error('Login failed');
  }

  return <Loading />;
};

/**
 * A Context provider for the authenticated user.
 *
 * Provide child components with the authenticated user. Display a loading screen while the user
 * information is being fetched. Provides two values: the current `user`, and a method for logging
 * out current user `logout`.
 *
 * Performs a fetch to the /user endpoint if access token is saved in storage.
 * If the /user endpoint response status code is 401, the user is logged out.
 * If the /user endpoint request fails for some other reason, and error is thrown.
 *
 * A possible alternative for this Context provider would be the ready-made AuthenticationProvider
 * from @axa-fr/react-oidc-context.
 */
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const history = useHistory();
  const [orgIdent, setOrgIdent] = useState(
    getUserFromStorage().organizationIdentifier
  );
  const queryClient = useQueryClient();
  const {
    data: user,
    isError,
    isLoading,
  } = useQuery({ queryKey: ['user'], queryFn: fetchIdentifiers });

  useEffect(() => {
    if (user?.organizationIdentifier) {
      setOrgIdent(user.organizationIdentifier);
    }
  }, [user]);

  const selectOrganizationIdentifier = useCallback(
    (orgIdentifier: OrganizationIdentifier, confirm = true) => {
      if (!user?.organizations) {
        return;
      }
      // TODO: What if organizations change when logged in?
      // TODO: This discards edit views' changes!
      // TODO: Get new username...
      // eslint-disable-next-line no-alert
      if (!confirm || window.confirm('Change organization?')) {
        const org = user.organizations[orgIdentifier.organization_uuid];
        const identifierUuid = orgIdentifier.identifier_uuid;
        addUserToStorage({
          ...user,
          organizationIdentifier: orgIdentifier,
          organization: org,
          identifierUuid,
        });
        setOrgIdent(orgIdentifier);
        queryClient.clear();
        history.push('/');
      }
    },
    [history, queryClient, user]
  );

  const logout = useCallback(() => {
    removeUserFromStorage();
    if (!endSession(POST_LOGOUT_REDIRECT_URI)) {
      window.location.assign('/');
    }
  }, []);

  // We can safely type cast user to User below, even if it can be undefined and null too.
  // We have multiple overloads for useAuth; the default one without arguments will ensure
  // we do have a user and an organization selected. It should be used in authenticated places
  // in the app.
  const value = useMemo(
    () => ({
      user: user as User,
      logout,
      organizationIdentifier: orgIdent,
      selectOrganizationIdentifier,
    }),
    [user, logout, orgIdent, selectOrganizationIdentifier]
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    throw new Error('Login failed');
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function useAuth(
  allowNoOrgSelected: true
): AuthContextType | AuthContextTypePartial | undefined;
function useAuth(): AuthContextType;
function useAuth(allowNoOrgSelected?: boolean) {
  const ctx = useContext(AuthContext);
  if (!allowNoOrgSelected && !ctx?.user?.organization) {
    // eslint-disable-next-line no-console
    console.error(
      '`useAuth()` with no arguments must be used only in places in component hierarchy where user is authenticated and has selected an organization'
    );
    throw new Error('errorGeneric');
  }
  return useContext(AuthContext);
}

export { AuthProvider, LoginCallback, useAuth };
