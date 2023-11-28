import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fetchDataConsumers } from 'api/search';
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
import { getDataConsumers } from 'util/mds-api';

const Index = () => {
  const { t } = useTranslation();
  const { offset, pageNumber } = usePagination();
  const { user } = useAuth();
  const { data, isError, isLoading, isSuccess, isPreviousData } = useQuery({
    queryKey: [
      'dataConsumers',
      { organization_uuid: user.organization.uuid },
      offset,
    ],
    queryFn: fetchDataConsumers,
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
  const dataConsumers = getDataConsumers(data);
  // TODO: If dc.name is empty, we don't have a link to click
  const rows = dataConsumers.map((dc) => ({
    name: (
      <AnnouncingLink
        className="table-cell-dc-name"
        to={`/dataConsumers/${dc.uuid}`}
      >
        {dc.name}
      </AnnouncingLink>
    ),
    created: formatDate(dc.created),
    updated: formatDate(dc.updated),
    uuid: dc.uuid,
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
          id="btn-create-dc"
          text={t('labelCreateDataConsumer')}
          variant="secondary"
          to="/dataConsumers/create"
          icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
        />
      </Button.Area>
      {dataConsumers.length > 0 ? (
        <>
          {showPagination && <Pagination {...paginationProps} />}
          <Table headings={headings} rows={rows} id="table-dc" />
          {showPagination && <Pagination {...paginationProps} scrollToTop />}
        </>
      ) : (
        pageNumber > 1 && <Pagination {...paginationProps} />
      )}
    </>
  );
};

export default Index;

/* Styled Components */

const StyledWrapper = styled.div`
  margin: ${(props) => props.theme.spacingL} 0;
`;
