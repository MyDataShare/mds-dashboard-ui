import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { fetchDataConsumer, fetchDataProvider } from 'api/get';
import { fetchProcessingRecords } from 'api/search';
import Alert from 'components/alert';
import AnnouncingLink from 'components/announcing-link';
import Breadcrumbs from 'components/breadcrumbs';
import Button from 'components/button';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import Pagination from 'components/pagination';
import CellRecordParticipants from 'components/record-table/cell-record-participants';
import CellRecordStatus from 'components/record-table/cell-record-status';
import CellRecordSubject from 'components/record-table/cell-record-subject';
import DropdownRecordActions from 'components/record-table/dropdown-record-actions';
import Table from 'components/table';
import { useAuth } from 'context/auth';
import { usePagination, useTitle } from 'hooks';
import { ActivationMode, RecordType } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { getPaginationProps } from 'util/general';
import { getMetadatas, getProcessingRecords } from 'util/mds-api';
import { getRecordStatusColor } from 'util/processing-record';
import {
  addParticipantsArrayToRecords,
  getNonDataSubjectParticipantInfos,
} from 'util/processing-record-participant';

const ProcessingRecords = ({ match }) => {
  const { t } = useTranslation();
  useTitle('pageTitleProcessingRecords', t);
  const { user } = useAuth();
  const { offset, pageNumber } = usePagination();
  const { uuid } = match.params;
  const history = useHistory();
  const searchFilters = {};
  let isDataConsumer = false;
  let isDataProvider = false;
  if (match.path.includes('dataConsumers')) {
    isDataConsumer = true;
    searchFilters.data_consumer_uuid = uuid;
  } else {
    isDataProvider = true;
    searchFilters.data_provider_uuid = uuid;
  }
  const {
    data: dcData,
    isError: dcIsError,
    isInitialLoading: dcIsLoading,
    isSuccess: dcIsSuccess,
  } = useQuery({
    queryKey: ['dataConsumer', { uuid }],
    queryFn: fetchDataConsumer,
    enabled: isDataConsumer,
  });
  const {
    data: dpData,
    isError: dpIsError,
    isInitialLoading: dpIsLoading,
    isSuccess: dpIsSuccess,
  } = useQuery({
    queryKey: ['dataProvider', { uuid }],
    queryFn: fetchDataProvider,
    enabled: isDataProvider,
  });
  const { data, isError, isLoading, isSuccess, isPreviousData } = useQuery({
    queryKey: ['processingRecords', searchFilters, offset],
    queryFn: fetchProcessingRecords,
    enabled:
      Object.keys(searchFilters).length > 0 && (dcIsSuccess || dpIsSuccess),
    keepPreviousData: true,
  });

  const onRowClick = useCallback(
    ({ rowData }) => history.push(`processingRecords/${rowData.uuid}`),
    [history]
  );
  const recordsData = useMemo(() => data || {}, [data]);
  const processingRecords = useMemo(
    () => getProcessingRecords(recordsData),
    [recordsData]
  );
  const allRecordsWithParticipants = useMemo(() => {
    if (processingRecords.length === 0) return {};
    return addParticipantsArrayToRecords(recordsData);
  }, [processingRecords.length, recordsData]);
  const metadatas = useMemo(() => getMetadatas(data), [data]);
  const { identifiers } = recordsData;
  let service;
  if (dcIsSuccess || dpIsSuccess) {
    service = isDataConsumer
      ? dcData.data_consumers[uuid]
      : dpData.data_providers[uuid];
  }
  const includeParticipants =
    !isDataConsumer ||
    (service &&
      service.activation_mode !== ActivationMode.DATA_SUBJECT_ACTIVATES);
  const rows = useMemo(
    () =>
      Object.values(allRecordsWithParticipants).map((pr) => {
        const participantInfos = includeParticipants
          ? getNonDataSubjectParticipantInfos(null, pr, pr.participants)
          : [];
        return {
          rowColor: getRecordStatusColor(pr),
          uuid: pr.uuid, // Not visible, but used in onRowClick
          subject: <CellRecordSubject record={pr} identifiers={identifiers} />,
          participants: includeParticipants ? (
            <CellRecordParticipants
              participantInfos={participantInfos}
              compact
            />
          ) : null,
          status: (
            <CellRecordStatus
              record={pr}
              participants={pr.participants}
              metadatas={metadatas}
            />
          ),
          actions: (
            <DropdownRecordActions
              record={pr}
              onOpen={(prUuid) => onRowClick({ rowData: { uuid: prUuid } })}
            />
          ),
        };
      }),
    [
      allRecordsWithParticipants,
      includeParticipants,
      identifiers,
      metadatas,
      onRowClick,
    ]
  );

  if (dcIsLoading || dpIsLoading || isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1 id="heading-prs">{t('headingProcessingRecords')}</h1>
        <Loading />
      </>
    );
  }

  if (dcIsError || dpIsError || isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const headings = [
    { text: t('status'), key: 'status' },
    { text: t('labelSubject'), key: 'subject' },
    {
      text: null,
      key: 'actions',
      width: 60,
      cellStyle: { paddingLeft: 0, paddingRight: 0 },
    },
  ];
  if (includeParticipants) {
    headings.splice(2, 0, {
      text: t('labelParticipants'),
      key: 'participants',
    });
  }
  if (
    isDataConsumer &&
    service?.ext_api_uuid !== null &&
    service?.record_type === RecordType.CONSENT
  ) {
    return <Redirect to="./members" />;
  }

  const showCreatePrButton =
    service &&
    isDataConsumer &&
    service.organization_uuid === user.organization.uuid &&
    !service.suspended;
  const { showPagination, paginationProps } = getPaginationProps({
    pageNumber,
    isLoading,
    isPreviousData,
    data: recordsData,
  });
  let dataProvider = null;
  if (
    isDataConsumer &&
    service.data_provider_uuid !== null &&
    'data_providers' in recordsData
  ) {
    dataProvider = recordsData.data_providers[service.data_provider_uuid];
  }
  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-prs">{t('headingProcessingRecords')}</h1>
      {isDataConsumer && (
        <LabeledValue
          label={t('labelDataConsumer')}
          value={service ? service.name : uuid}
        />
      )}
      {isDataProvider && (
        <LabeledValue
          label={t('labelDataProvider')}
          value={service ? service.name : uuid}
        />
      )}
      {service && service.suspended && (
        <StyledAlertWrapper>
          <Alert id="alert-service-suspended" variant="info">
            {t('textServiceSuspended')}
          </Alert>
        </StyledAlertWrapper>
      )}
      {isDataConsumer && dataProvider && (
        <LabeledValue
          label={t('labelDataProvider')}
          value={
            dataProvider ? (
              <AnnouncingLink to={`/dataProviders/${dataProvider.uuid}`}>
                {dataProvider.name}
              </AnnouncingLink>
            ) : null
          }
        />
      )}
      {showCreatePrButton && (
        <>
          {[
            ActivationMode.ANY_ACTIVATOR_ACTIVATES,
            ActivationMode.ALL_ACTIVATORS_ACTIVATE,
          ].includes(service.activation_mode) && (
            <Alert variant="warning">
              {t('textWarningActivationModeNotSupported')}
            </Alert>
          )}
          <Button.Area justify="start">
            <Button
              id="btn-create-pr"
              variant="secondary"
              text={t('labelCreateProcessingRecord')}
              icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
              to="processingRecords/create"
              disabled={
                ![
                  ActivationMode.DATA_SUBJECT_ACTIVATES,
                  ActivationMode.AUTOMATICALLY_ACTIVATED,
                ].includes(service.activation_mode)
              }
            />
          </Button.Area>
        </>
      )}
      {rows.length ? (
        <>
          {showPagination && <Pagination {...paginationProps} />}
          <Table
            id="table-prs"
            headings={headings}
            rows={rows}
            onRowClick={onRowClick}
          />
          {showPagination && <Pagination {...paginationProps} />}
        </>
      ) : (
        <StyledWrapper>
          <Alert id="alert-no-prs" variant="info">
            {t('textNoProcessingRecords')}
          </Alert>
          {pageNumber > 1 && <Pagination {...paginationProps} />}
        </StyledWrapper>
      )}
    </>
  );
};

ProcessingRecords.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProcessingRecords;

/* Styled Components */

const StyledWrapper = styled.div`
  margin-top: 2em;
`;

const StyledAlertWrapper = styled.div`
  margin: 1.5em 0;
`;
