import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteModel } from 'api';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fetchOrganizationIdentifiers } from 'api/search';
import Button from 'components/button';
import Loading from 'components/loading';
import Pagination from 'components/pagination';
import SensitiveField from 'components/sensitive-field';
import Table from 'components/table';
import { useAuth } from 'context/auth';
import { usePagination } from 'hooks';
import { Model } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getPaginationProps } from 'util/general';
import {
  formatUsername,
  getOrganizationIdentifiers,
  getUsername,
} from 'util/mds-api';

const Users = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { offset, pageNumber } = usePagination();
  const { data, isError, isLoading, isSuccess, isPreviousData } = useQuery({
    queryKey: ['organizationIdentifiers', {}, offset],
    queryFn: fetchOrganizationIdentifiers,
    keepPreviousData: true,
  });

  const removeUser = useMutation(deleteModel, {
    onSuccess: () => {
      queryClient.invalidateQueries('organizationIdentifiers');
    },
  });

  const onRemoveUser = (organizationIdentifierUuid) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(t('textConfirmDeleteUser'))) {
      removeUser.mutate({
        uuid: organizationIdentifierUuid,
        model: Model.ORGANIZATION_IDENTIFIER,
      });
    }
  };

  if (isLoading) {
    return (
      <StyledWrapper>
        <Loading />
      </StyledWrapper>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const headings = [
    { text: t('name'), key: 'name' },
    { text: t('labelIdentifier'), key: 'identifier' },
    { text: t('labelRole'), key: 'role' },
    { text: t('labelAdded'), key: 'added' },
    { text: '', key: 'removeUser' },
  ];

  const organizationIdentifiers = getOrganizationIdentifiers(data);
  const rows = organizationIdentifiers.map((orgIdent) => {
    const identifier = data.identifiers[orgIdent.identifier_uuid];
    const username = formatUsername(getUsername(data, identifier.uuid));
    return {
      name: username || <i>{t('labelNameNotAvailable')}</i>,
      identifier: <SensitiveField>{identifier.id}</SensitiveField>,
      role: t(orgIdent.role),
      added: formatDate(orgIdent.created),
      removeUser:
        user.identifierUuid !== identifier.uuid ? (
          <Button
            className="btn-remove-user"
            type="button"
            variant="text"
            colorVariant="negative"
            text={t('labelRemoveUser')}
            onClick={() => onRemoveUser(orgIdent.uuid)}
          />
        ) : null,
    };
  });

  const { showPagination, paginationProps } = getPaginationProps({
    pageNumber,
    isLoading,
    isPreviousData,
    data,
  });
  return (
    <>
      <Button.Area justify="start">
        <Button
          id="btn-add-user"
          text={t('labelAddUser')}
          variant="secondary"
          to="/users/add"
          icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
        />
      </Button.Area>
      {organizationIdentifiers.length > 0 ? (
        <>
          {showPagination && <Pagination {...paginationProps} />}
          <Table id="table-user" headings={headings} rows={rows} />
          {showPagination && <Pagination {...paginationProps} scrollToTop />}
        </>
      ) : (
        pageNumber > 1 && <Pagination {...paginationProps} />
      )}
    </>
  );
};

export default Users;

/* Styled Components */

const StyledWrapper = styled.div`
  margin: ${(props) => props.theme.spacingL} 0;
`;
