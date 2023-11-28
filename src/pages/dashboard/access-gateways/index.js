import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fetchAccessGateways } from 'api/search';
import AnnouncingLink from 'components/announcing-link';
import Button from 'components/button';
import Loading from 'components/loading';
import Pagination from 'components/pagination';
import Table from 'components/table';
import { usePagination } from 'hooks';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getPaginationProps } from 'util/general';
import { getAccessGateways } from 'util/mds-api';

const AccessGateways = () => {
  const { t } = useTranslation();
  const { offset, pageNumber } = usePagination();
  const { data, isError, isLoading, isSuccess, isPreviousData } = useQuery({
    queryKey: ['accessGateways', {}, offset],
    queryFn: fetchAccessGateways,
    keepPreviousData: true,
  });

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
    { text: t('created'), key: 'created' },
    { text: t('updated'), key: 'updated' },
    { text: t('uuid'), key: 'uuid' },
  ];

  const accessGateways = getAccessGateways(data);
  const rows = accessGateways.map((agw) => ({
    name: (
      <AnnouncingLink
        className="table-cell-agw-name"
        to={`/accessGateways/${agw.uuid}`}
      >
        {agw.name}
      </AnnouncingLink>
    ),
    created: formatDate(agw.created),
    updated: formatDate(agw.updated),
    uuid: agw.uuid,
  }));

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
          id="btn-create-agw"
          text={t('labelCreateAccessGateway')}
          variant="secondary"
          to="/accessGateways/create"
          icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
        />
      </Button.Area>
      {accessGateways.length > 0 ? (
        <>
          {showPagination && <Pagination {...paginationProps} />}
          <Table id="table-agw" headings={headings} rows={rows} />
          {showPagination && <Pagination {...paginationProps} scrollToTop />}
        </>
      ) : (
        pageNumber > 1 && <Pagination {...paginationProps} />
      )}
    </>
  );
};

export default AccessGateways;

/* Styled Components */

const StyledWrapper = styled.div`
  margin: ${(props) => props.theme.spacingL} 0;
`;
