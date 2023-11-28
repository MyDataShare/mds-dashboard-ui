import i18next from 'i18next';

import { QUERY_ERR_MSG_KEY } from 'util/constants';

export const extractEmailFromContactDetails = (person) =>
  person?.contact_details?.find((cd) => cd.type === 'email_address')?.detail;

export const getLocalizedUrl = (urlString) => {
  const url = new URL(urlString);
  url.searchParams.append('lng', i18next.language);
  return url.toString();
};

export const getPaginationProps = ({
  pageNumber,
  isLoading,
  isPreviousData,
  data,
}) => {
  const paginationProps = {
    isLoading,
    isPreviousData,
    hasNextPage: !!data.next_offset,
  };
  const showPagination =
    isPreviousData || paginationProps.hasNextPage || pageNumber > 1;
  return { showPagination, paginationProps };
};

export const handleQueryError = (isError, isSuccess) => {
  if (isError) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }
  // TODO: Is there any point in showing some other error for unhandled query status?
  if (!isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }
};
