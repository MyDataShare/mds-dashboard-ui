import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fetchDataProviders } from 'api/search';
import AnnouncingLink from 'components/announcing-link';
import Button from 'components/button';
import Loading from 'components/loading';
import Pagination from 'components/pagination';
import Table from 'components/table';
import { useAuth } from 'context/auth';
import { usePagination } from 'hooks';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getPaginationProps } from 'util/general';
import { getDataProviders } from 'util/mds-api';

const DataProviders = () => {
  const { t } = useTranslation();
  const { offset, pageNumber } = usePagination();
  const { user } = useAuth();
  const { data, isError, isLoading, isSuccess, isPreviousData } = useQuery({
    queryKey: [
      'dataProviders',
      { organization_uuid: user.organization.uuid },
      offset,
    ],
    queryFn: fetchDataProviders,
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
  const dataProviders = getDataProviders(data);
  const rows = dataProviders.map((dp) => ({
    name: (
      <AnnouncingLink
        className="table-cell-dp-name"
        to={`/dataProviders/${dp.uuid}`}
      >
        {dp.name}
      </AnnouncingLink>
    ),
    created: formatDate(dp.created),
    updated: formatDate(dp.updated),
    uuid: dp.uuid,
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
          id="btn-create-dp"
          text={t('labelCreateDataProvider')}
          variant="secondary"
          to="/dataProviders/create"
          icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
        />
      </Button.Area>
      {dataProviders.length > 0 ? (
        <>
          {showPagination && <Pagination {...paginationProps} />}
          <Table id="table-dp" headings={headings} rows={rows} />
          {showPagination && <Pagination {...paginationProps} scrollToTop />}
        </>
      ) : (
        pageNumber > 1 && <Pagination {...paginationProps} />
      )}
    </>
  );
};

export default DataProviders;

/* Styled Components */

const StyledWrapper = styled.div`
  margin: ${(props) => props.theme.spacingL} 0;
`;
