import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { capitalize } from 'util/string';

const ResultSummary = ({
  currentCount,
  pageCount,
  pageNumber,
  pageSize,
  totalCount,
  uiFilters,
}) => {
  const filters = Object.entries(uiFilters)
    .filter(([k, v]) => k !== 'all' && !!v)
    .map(([k]) => k);
  const { t } = useTranslation();
  const startCount = pageNumber * pageSize - pageSize + 1;
  const endCount = startCount + currentCount - 1;
  // TODO: Handle startCount == endCount (only one result in paginated page)
  const formattedFilters = filters
    .map((f) => t(`label${capitalize(f)}`))
    .join(', ');
  if (pageCount > 1) {
    return (
      <StyledWrapper>
        {filters.length > 0
          ? t('labelResultCountPaginatedWithFilters', {
              startCount,
              endCount,
              totalCount,
              filters: formattedFilters,
            })
          : t('labelResultCountPaginated', {
              startCount,
              endCount,
              totalCount,
            })}
      </StyledWrapper>
    );
  }
  return (
    <StyledWrapper>
      {filters.length > 0
        ? t('labelResultCountWithFilters', {
            count: endCount,
            filters: formattedFilters,
          })
        : t('labelResultCount', { count: endCount })}
    </StyledWrapper>
  );
};

ResultSummary.propTypes = {
  currentCount: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  pageNumber: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  uiFilters: PropTypes.objectOf(PropTypes.bool).isRequired,
};

export default ResultSummary;

/* Styled Components */

const StyledWrapper = styled.div`
  margin-bottom: 1.5em;
`;
