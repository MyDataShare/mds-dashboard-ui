import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import useQueryParams from './query-params';
import { SEARCH_LIMIT, SEARCH_OFFSET_MAX } from 'util/constants';

const pageNumberToOffset = (pageNumber) => (pageNumber - 1) * SEARCH_LIMIT;

const parsePageNumber = (pageNumberOrString) => {
  const pageNumber = parseInt(pageNumberOrString, 10);
  if (
    Number.isNaN(pageNumber) ||
    pageNumber <= 0 ||
    pageNumberToOffset(pageNumber) > SEARCH_OFFSET_MAX
  ) {
    return -1;
  }
  return pageNumber;
};

const usePagination = () => {
  const history = useHistory();
  const queryParams = useQueryParams();
  let pageNumber = parsePageNumber(queryParams.get('page') || 1);
  if (pageNumber === -1) {
    pageNumber = 1;
    history.replace({ search: '?page=1' });
  }
  return useMemo(
    () => ({
      offset: pageNumberToOffset(pageNumber),
      pageNumber,
      changePage: (newPageNumber) => {
        const parsedNewPageNumber = parsePageNumber(newPageNumber);
        if (parsedNewPageNumber === -1) {
          return history.replace({ search: '?page=1' });
        }
        return history.push({ search: `?page=${parsedNewPageNumber}` });
      },
      changeNextPage: () => history.push({ search: `?page=${pageNumber + 1}` }),
      changePreviousPage: () =>
        history.push({ search: `?page=${pageNumber - 1}` }),
    }),
    [history, pageNumber]
  );
};

export default usePagination;
