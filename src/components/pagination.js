import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AnnouncingLink from 'components/announcing-link';
import Button from 'components/button';
import SpinnerIcon from 'components/spinner-icon';
import { usePagination, usePrevious } from 'hooks';

const Pagination = ({
  hasNextPage,
  isLoading,
  isPreviousData,
  scrollToTop,
  totalPages,
}) => {
  const { t } = useTranslation();
  const [lastNav, setLastNav] = useState(null);
  const { pageNumber } = usePagination();
  const previousPageNumber = usePrevious(pageNumber);

  useEffect(() => {
    if (pageNumber !== previousPageNumber) {
      setLastNav(previousPageNumber >= pageNumber ? 'previous' : 'next');
    }
  }, [pageNumber, previousPageNumber]);

  const loading = isLoading || isPreviousData;
  const previousLoading = loading && lastNav === 'previous';
  const nextLoading = loading && lastNav === 'next';
  const previousDisabled = pageNumber <= 1;
  const nextDisabled = !hasNextPage || pageNumber === totalPages || loading;

  const pageNumbers =
    totalPages === null
      ? getPageNumbersUnknownTotal(pageNumber, hasNextPage)
      : getPageNumbersKnownTotal(pageNumber, totalPages);
  return (
    <StyledFlexWrapper>
      <StyledButtonWrapper>
        <StyledButton
          aria-label={t('labelPreviousPage')}
          title={t('labelPreviousPage')}
          variant="text"
          to={{ search: `?page=${pageNumber - 1}` }}
          icon={
            previousLoading ? (
              <SpinnerIcon />
            ) : (
              <FontAwesomeIcon icon={icon({ name: 'chevron-left' })} />
            )
          }
          iconWidth={ICON_SIZE}
          iconHeight={ICON_SIZE}
          disabled={previousDisabled}
        />
      </StyledButtonWrapper>
      <StyledPageList>
        {pageNumbers.map((n) =>
          n === '...' ? (
            <StyledPageListItem key={n}>
              <StyledStaticPageIndicator>{n}</StyledStaticPageIndicator>
            </StyledPageListItem>
          ) : (
            <StyledPageListItem $alwaysVisible={pageNumber === n} key={n}>
              {pageNumber === n ? (
                <StyledPageIndicatorCurrent>
                  {pageNumber}
                </StyledPageIndicatorCurrent>
              ) : (
                <StyledPageIndicator
                  onClick={() => onClickChangePage(scrollToTop)}
                  to={{ search: `?page=${n}` }}
                  aria-label={t('labelGoToPage', { page: n })}
                  title={t('labelGoToPage', { page: n })}
                >
                  {n}
                </StyledPageIndicator>
              )}
            </StyledPageListItem>
          )
        )}
      </StyledPageList>
      <StyledButtonWrapper>
        <StyledButton
          onClick={() => onClickChangePage(scrollToTop)}
          aria-label={nextDisabled ? null : t('labelNextPage')}
          title={nextDisabled ? null : t('labelNextPage')}
          variant="text"
          to={{ search: `?page=${pageNumber + 1}` }}
          icon={
            nextLoading ? (
              <SpinnerIcon />
            ) : (
              <FontAwesomeIcon icon={icon({ name: 'chevron-right' })} />
            )
          }
          iconWidth={ICON_SIZE}
          iconHeight={ICON_SIZE}
          disabled={nextDisabled}
        />
      </StyledButtonWrapper>
    </StyledFlexWrapper>
  );
};

Pagination.propTypes = {
  hasNextPage: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isPreviousData: PropTypes.bool.isRequired,
  scrollToTop: PropTypes.bool,
  totalPages: PropTypes.number,
};

Pagination.defaultProps = {
  scrollToTop: false,
  totalPages: null,
};

export default Pagination;

/* Helpers */

const ICON_SIZE = '1em';

const getPageNumbersKnownTotal = (pageNumber, totalPages) => {
  const pageNumbers = [];
  const extraPagesToStart =
    pageNumber >= totalPages - 4
      ? Math.min(4 - (totalPages - pageNumber), 4)
      : 0;
  for (
    let i = pageNumber - 1;
    i >= pageNumber - 4 - extraPagesToStart && i > 0;
    i -= 1
  ) {
    if (i === pageNumber - 4 - extraPagesToStart + 1 && i > 2) {
      pageNumbers.unshift('...');
    } else if (i === pageNumber - 4 - extraPagesToStart) {
      pageNumbers.unshift(1);
    } else {
      pageNumbers.unshift(i);
    }
  }
  pageNumbers.push(pageNumber);
  const extraPagesToEnd = pageNumber <= 5 ? 5 - pageNumber : 0;
  for (
    let i = pageNumber + 1;
    i <= pageNumber + 4 + extraPagesToEnd && i <= totalPages;
    i += 1
  ) {
    if (i === pageNumber + 4 + extraPagesToEnd - 1 && totalPages > i + 1) {
      pageNumbers.push('...');
    } else if (i === pageNumber + 4 + extraPagesToEnd && totalPages > i) {
      pageNumbers.push(totalPages);
    } else {
      pageNumbers.push(i);
    }
  }
  return pageNumbers;
};

const getPageNumbersUnknownTotal = (pageNumber, hasNextPage) => {
  // TODO: When we have support for getting total number of pages, implement both ways not only back
  //       --> Then, make sure we always have 9 entries (including ellipsis')
  if (pageNumber <= 1) return [1];
  const ret = [];
  const maxN = 4;
  let n = 1;
  let isCutOff = false;
  if (pageNumber >= 5) {
    if (pageNumber > 5) {
      n += 1;
    }
    isCutOff = true;
    n += 1;
  }
  for (let i = pageNumber - 1; i >= 1 && n <= maxN; i -= 1, n += 1) {
    ret.push(i);
  }
  if (isCutOff) {
    if (pageNumber !== 5) ret.push('...');
    ret.push(1);
  }
  ret.reverse();
  ret.push(pageNumber);
  if (hasNextPage) {
    ret.push(pageNumber + 1);
  }
  return ret;
};

const onClickChangePage = (scrollToTop) => {
  if (scrollToTop) {
    window.scrollTo(0, 0);
  }
};

/* Styled Components */

const StyledFlexWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1em 1em;
`;

const StyledButtonWrapper = styled.div`
  width: auto;
`;

const StyledButton = styled(Button)`
  margin: 0.75em;
`;

const StyledPageList = styled.ul`
  display: flex;
  align-items: center;
  gap: 0.75em;
  font-weight: ${(p) => p.theme.fontRegular};
  font-size: 1em;
  list-style: none;
  max-width: 100%;
  margin: 0;
  margin-block: 0;
  margin-inline: 0;
  padding-inline: 0;
`;

const StyledPageListItem = styled.li`
  display: block;
  margin: 0;
  @media only screen and (max-width: 500px) {
    display: ${(p) => (p.$alwaysVisible ? 'block' : 'none')};
  }
`;

const pageIndicatorStyles = (p) => `
  min-width: 2.25em;
  text-align: center;
  border-radius: 0.25em;
  padding: 0.125em 0.375em;
  border: 2px solid transparent;
  transition: background-color 150ms ease-in, color 150ms ease-in, border-color 150ms ease-in;
  text-decoration: none;
  &&:hover {
    border-color: ${p.theme.vgGreen};
  }
`;

const StyledPageIndicator = styled(AnnouncingLink)`
  ${(p) => pageIndicatorStyles(p)};
  display: block;
`;

const StyledStaticPageIndicator = styled.div`
  min-width: 2.25em;
  text-align: center;
  border-radius: 0.25em;
  padding: 0.125em 0.375em;
  border: 2px solid transparent;
  @media only screen and (max-width: 500px) {
    display: none;
  }
`;

const StyledPageIndicatorCurrent = styled.div`
  ${(p) => pageIndicatorStyles(p)};
  font-weight: ${(p) => p.theme.fontSemiBold};
  background-color: ${(p) => p.theme.vgGreen};
  color: #ffffff;
  &&:hover {
    color: #ffffff;
  }
  @media only screen and (max-width: 500px) {
    display: block;
  }
`;
