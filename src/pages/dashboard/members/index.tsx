import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { fetchExternalAPI } from 'api';
import { alpha2ToAlpha3 } from 'i18n-iso-countries';
import {
  combinePaginatedResponses,
  getTranslation,
  LANGUAGES,
} from 'mydatashare-core';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, RouteComponentProps, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { fetchDataConsumer } from 'api/get';
import {
  fetchProcessingRecords,
  ProcessingRecordSearchPayload,
} from 'api/search';
import Alert from 'components/alert';
import AnnouncingLink from 'components/announcing-link';
import Breadcrumbs from 'components/breadcrumbs';
import Checkbox from 'components/checkbox';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import Pagination from 'components/pagination';
import CellRecordParticipants from 'components/record-table/cell-record-participants';
import CellRecordStatus from 'components/record-table/cell-record-status';
import CellRecordSubject from 'components/record-table/cell-record-subject';
import DropdownRecordActions from 'components/record-table/dropdown-record-actions';
import Table from 'components/table';
import { useItemSelection, usePagination, useTitle } from 'hooks';
import ActionButtons from 'pages/dashboard/members/components/action-buttons';
import EmailNotificationModal from 'pages/dashboard/members/components/email-notification-modal';
import FiltersSection from 'pages/dashboard/members/components/filters-section';
import PersonModal from 'pages/dashboard/members/components/person-modal';
import ProcessingRecordModal from 'pages/dashboard/members/components/processing-record-modal';
import ResultSummary from 'pages/dashboard/members/components/result-summary';
import SelectControls from 'pages/dashboard/members/components/select-controls';
import WithdrawModal from 'pages/dashboard/members/components/withdraw-modal';
import { getPersonRowKey } from 'pages/dashboard/members/util';
import {
  ParticipantInfo,
  Person,
  PersonWithRecords,
  ProcessingRecordFilters,
  ProcessingRecordFilterStats,
  ProcessingRecordWithParticipants,
} from 'types';
import { Metadata, ProcessingRecord } from 'types/api-objects';
import { ProcessingRecordsResponse } from 'types/api-responses';
import { ActivationMode, ParticipantRole, RecordType } from 'types/enums';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { getMetadatas } from 'util/mds-api';
import {
  getRecordStatusColor,
  getRecordStatusSortKey,
  NON_TERMINAL_STATUSES,
} from 'util/processing-record';
import {
  addParticipantsArrayToRecords,
  getNonDataSubjectParticipantInfos,
} from 'util/processing-record-participant';
import { camelToSnake } from 'util/string';

// TODO: Use refetchOnWindowFocus: false on all requests here

interface RowData {
  actions: ReactNode | null;
  participantInfos: ParticipantInfo[];
  participants: ReactNode | null;
  personData: Person | null;
  recordsData: ProcessingRecord[];
  rowColor: string | null;
  select: ReactNode | null;
  status: ReactNode;
  subject: ReactNode;
  uuid: string;
}

interface MatchParams {
  uuid: string;
}

const Members = ({ match }: RouteComponentProps<MatchParams>) => {
  const { t, i18n } = useTranslation();
  useTitle('pageTitleMembers', t);
  const { pageNumber, changePage } = usePagination();
  const { uuid } = match.params;
  const history = useHistory();
  const queryClient = useQueryClient();
  const cellMeasurerCacheRef = useRef(null);
  const tableRef = useRef(null);

  const [personModalData, setPersonModalData] = useState<{
    person: Person;
    participantInfos?: ParticipantInfo[];
  } | null>(null);
  const [prModalData, setPrModalData] = useState<
    {
      person: Person;
      participantInfos: ParticipantInfo[];
      records: ProcessingRecord[];
    }[]
  >([]);
  const [emailModalData, setEmailModalData] = useState([]);
  const [withdrawModalData, setWithdrawModalData] = useState([]);
  const [uiFilters, setUiFilters] = useState<ProcessingRecordFilters>({
    all: true,
    notTargeted: false,
    notInTargetGroup: false,
    targeted: false,
    active: false,
    declined: false,
    pending: false,
    suspended: false,
    withdrawn: false,
    expired: false,
  });
  const {
    isSelectActivated,
    setIsSelectActivated,
    selectAllItems,
    selectItem,
    selectedItems,
    setSelectedItems,
  } = useItemSelection();

  const reflowTable = () => {
    // TODO: Make this reusable since all tables could use this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Add types to Table ref
    cellMeasurerCacheRef?.current?.clearAll();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Add types to CellMeasurer ref
    tableRef?.current?.recomputeRowHeights(0);
  };

  const {
    data: dcData,
    isError: dcIsError,
    isLoading: dcIsLoading,
    isSuccess: dcIsSuccess,
  } = useQuery({
    queryKey: ['dataConsumer', { uuid }],
    queryFn: fetchDataConsumer,
  });

  const prPayload: ProcessingRecordSearchPayload = {
    data_consumer_uuid: uuid,
    reference: '',
    record_type: RecordType.CONSENT,
  };
  const dc = !dcIsSuccess ? null : dcData.data_consumers[uuid];
  let dp = null;
  if (dcIsSuccess && dc?.data_provider_uuid && dcData?.data_providers) {
    dp = dcData.data_providers[dc.data_provider_uuid];
    if (dp) {
      prPayload.data_provider_uuid = dp.uuid;
    }
  }
  const isTargeted =
    dc &&
    dcData &&
    !!dc.ext_api_uuid &&
    dcData.ext_apis &&
    dc.ext_api_uuid in dcData.ext_apis;
  const includeParticipants =
    dc?.activation_mode !== ActivationMode.DATA_SUBJECT_ACTIVATES;
  const dcOrDpSuspended = !!(dc?.suspended || (dp && dp.suspended));

  // Non-null assertions are used on next line, because isTargeted has already checked that dc,
  // dc.ext_api_uuid, dcData and dcData.ext_apis are all non-null.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const extAPI = !isTargeted ? null : dcData.ext_apis![dc.ext_api_uuid!];

  const prQueryKey: [string, ProcessingRecordSearchPayload] = [
    'processingRecords',
    prPayload,
  ];
  // Note that refetchOnWindowFocus is disabled on this page, since we do many requests (all pages)
  const {
    data,
    isError,
    isLoading,
    isSuccess,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: prQueryKey,
    queryFn: fetchProcessingRecords,
    enabled: !!dc && dcIsSuccess,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  if (!isLoading && !isFetchingNextPage && hasNextPage) {
    fetchNextPage();
  }

  // members query will be only enabled if we have an ExtAPI, so the query
  // will never be executed with uuid ''
  const membersQueryKey: [string, { uuid: string }] = [
    'members',
    { uuid: extAPI?.uuid || '' },
  ];
  const {
    data: extData,
    isSuccess: extIsSuccess,
    isError: extIsError,
    isLoading: extIsLoading,
    isFetchingNextPage: extIsFetchingNextPage,
    fetchNextPage: extFetchNextPage,
    hasNextPage: extHasNextPage,
  } = useInfiniteQuery({
    queryKey: membersQueryKey,
    queryFn: fetchExternalAPI,
    enabled: !!dc && dcIsSuccess,
    refetchOnWindowFocus: false,
  });

  if (!extIsLoading && !extIsFetchingNextPage && extHasNextPage) {
    extFetchNextPage();
  }

  // Recalculate row heights when PR or members data changes
  useEffect(() => {
    if (isSuccess || extIsSuccess) {
      reflowTable();
    }
  }, [data, isSuccess, extData, extIsSuccess]);

  // Recompute row heights on page change
  useEffect(() => {
    reflowTable();
  }, [pageNumber]);

  const onRowClick = useCallback(
    ({ rowData, event }: { rowData: Partial<RowData>; event?: MouseEvent }) => {
      if (isSelectActivated) {
        event?.preventDefault(); // Prevent clicking selection checkboxes firing up onRowClick twice
        selectItem(rowData.uuid);
      } else if (rowData.personData && rowData?.recordsData?.length === 0) {
        setPersonModalData({
          person: rowData.personData,
          participantInfos: rowData.participantInfos,
        });
      } else {
        history.push(`members/${rowData.uuid}`);
      }
    },
    [history, isSelectActivated, selectItem]
  );

  // We have potentially a lot of data here which we have to process, so most are memoized below to
  // avoid needlessly processing them on every re-render. The underlying data is only re-processed
  // if the API data changes, and shown rows are processed only when the data or filters change.

  const recordsData = useMemo(() => {
    if (data?.pages) return combinePaginatedResponses(data.pages);
    return {};
  }, [data]);

  const personsData = useMemo(() => {
    if (extData?.pages) return combineExtAPIResponses(extData.pages);
    return {};
  }, [extData]);

  const { identifiers } = recordsData;

  const metadatas = useMemo(() => getMetadatas(recordsData), [recordsData]);

  const allPersonsAndRecords: PersonWithRecords[] = useMemo(() => {
    const persons = personsData?.persons ? personsData.persons : [];
    if (!recordsData?.processing_records || !dc) return [];
    return combinePersonsAndRecords(persons, recordsData, dc.activation_mode);
  }, [personsData.persons, recordsData, dc]);

  const allRowsById = useMemo(
    () =>
      Object.fromEntries(
        allPersonsAndRecords.map((row: PersonWithRecords) => [
          getPersonRowKey(row),
          row,
        ])
      ),
    [allPersonsAndRecords]
  );

  // Each person/PR row has a key: person.id if no PRs, otherwise the PR UUID. If the API data
  // changes during selection mode so that a selected person now has a PR, the underlying row key
  // will change from person.id to PR.uuid. But we would still have the person's id in selected
  // items, so we should prune away all selected items whose key is not found in allRowsById.
  usePruneOrphanedSelections(allRowsById, selectedItems, setSelectedItems);

  const stats = useMemo(
    () => getStats(allPersonsAndRecords),
    [allPersonsAndRecords]
  );

  const filteredPersonsAndRecords: PersonWithRecords[] = useMemo(
    () => sortedRows(filterPersonsAndRecords(allPersonsAndRecords, uiFilters)),
    [allPersonsAndRecords, uiFilters]
  );

  const rows: RowData[] = useMemo(
    () =>
      filteredPersonsAndRecords.map(({ person, records, participantInfos }) => {
        const hasRecords = records.length > 0;
        const key = hasRecords ? records[0].uuid : person?.id || '';
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: useItemSelection not yet converted to TS
        const isRowSelected = selectedItems.includes(key);
        return {
          rowColor: getRecordStatusColor(hasRecords ? records[0] : null),
          select: isSelectActivated ? (
            <StyledCellSelectIndicator>
              <Checkbox
                withoutForm
                id={`select-${key}`}
                name={`select-${key}`}
                checked={isRowSelected}
              />
            </StyledCellSelectIndicator>
          ) : null,
          uuid: key, // Not visible, but used in onRowClick
          personData: person,
          participantInfos,
          recordsData: records,
          subject: (
            <CellRecordSubject
              person={person}
              record={hasRecords ? records[0] : null}
              identifiers={identifiers}
            />
          ),
          participants: includeParticipants ? (
            <CellRecordParticipants
              participantInfos={participantInfos}
              compact
            />
          ) : null,
          status: (
            <CellRecordStatus
              record={records.length > 0 ? records[0] : null}
              participants={records.length > 0 ? records[0].participants : null}
              metadatas={metadatas}
            />
          ),
          actions: hasRecords ? (
            <DropdownRecordActions
              record={records[0]}
              onOpen={(prUuid) => onRowClick({ rowData: { uuid: prUuid } })}
            />
          ) : null,
        };
      }),
    [
      filteredPersonsAndRecords,
      identifiers,
      includeParticipants,
      isSelectActivated,
      metadatas,
      onRowClick,
      selectedItems,
    ]
  );

  const currentPageRows = rows.slice(
    (pageNumber - 1) * pageLimit,
    (pageNumber - 1) * pageLimit + pageLimit
  );
  const totalPages = Math.ceil(filteredPersonsAndRecords.length / pageLimit);

  if (
    dc &&
    (dc.ext_api_uuid === null || dc.record_type !== RecordType.CONSENT)
  ) {
    return <Redirect to="./processingRecords" />;
  }

  const isAnyLoading =
    isLoading || dcIsLoading || extIsLoading || hasNextPage || extHasNextPage;
  if (isAnyLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1 id="heading-members">{t('headingMembers')}</h1>
        <Loading />
      </>
    );
  }

  if (extIsError) {
    throw new Error(t('errorQueryExtData'));
  }

  if (dcIsError || isError || !dcIsSuccess || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  if (pageNumber > totalPages && totalPages > 0) {
    changePage(1);
  }

  let dcMetadatas: Record<string, Metadata> = {};
  if (dcData.metadatas) {
    dcMetadatas = dcData.metadatas;
  }

  const headings = [
    {
      text: null,
      key: 'select',
      width: 0,
      style: { padding: 0, margin: 0 },
    },
    { text: null, key: 'status' },
    { text: t('labelSubject'), key: 'subject' },
    {
      text: null,
      key: 'actions',
      width: 60,
      cellStyle: { paddingLeft: 0, paddingRight: 0 },
    },
  ];
  if (includeParticipants) {
    headings.splice(3, 0, {
      text: t('labelParticipants'),
      key: 'participants',
    });
  }
  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-prs">{t('headingMembers')}</h1>
      {dc && <LabeledValue label={t('labelDataConsumer')} value={dc.name} />}
      {dp && (
        <LabeledValue
          label={t('labelDataProvider')}
          value={
            dp ? (
              <AnnouncingLink to={`/dataProviders/${dp.uuid}`}>
                {dp.name}
              </AnnouncingLink>
            ) : null
          }
        />
      )}
      {dp && dp.suspended && (
        <StyledAlert id="alert-dp-suspended" variant="info">
          {t('textDataProviderSuspended')}
        </StyledAlert>
      )}
      {extAPI && (
        <LabeledValue
          label={t('labelSelectedRecordTargetGroup')}
          value={getTranslation(
            extAPI,
            'name',
            LANGUAGES[i18n.language],
            dcMetadatas
          )}
        />
      )}
      {dc?.suspended && (
        <StyledAlert id="alert-service-suspended" variant="info">
          {t('textServiceSuspended')}
        </StyledAlert>
      )}
      {stats.notInTargetGroup.length > 0 && (
        <StyledAlert id="alert-persons-not-in-group" variant="info">
          {t('textRecordsExistForPersonsOutsideGroup')}
        </StyledAlert>
      )}
      {dc && allPersonsAndRecords.length > 0 && (
        <>
          <FiltersSection
            stats={stats}
            uiFilters={uiFilters}
            setUiFilters={setUiFilters}
          />
          <ResultSummary
            currentCount={currentPageRows.length}
            pageCount={totalPages}
            pageNumber={pageNumber}
            pageSize={pageLimit}
            totalCount={rows.length}
            uiFilters={uiFilters}
          />
          <ActionButtons
            allRowsById={allRowsById}
            dc={dc}
            selectedItems={selectedItems}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: ActionButtons component not yet converted to TS
            stats={stats}
            setPrModalData={setPrModalData}
            setEmailModalData={setEmailModalData}
            setWithdrawModalData={setWithdrawModalData}
            suspended={dcOrDpSuspended}
          />
          <SelectControls
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: SelectControls component not yet converted to TS
            filteredPersonsAndRecords={filteredPersonsAndRecords}
            setIsSelectActivated={setIsSelectActivated}
            isSelectActivated={isSelectActivated}
            selectedItems={selectedItems}
            selectAllItems={selectAllItems}
            clearSelections={() => setSelectedItems([])}
          />
        </>
      )}
      {currentPageRows.length ? (
        <StyledTableWrapper $selectActivated={isSelectActivated}>
          <Table
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Table component not yet converted to TS
            id="table-members"
            ref={tableRef}
            cellMeasurerCacheRef={cellMeasurerCacheRef}
            headings={headings}
            rows={currentPageRows}
            onRowClick={onRowClick}
          />
        </StyledTableWrapper>
      ) : (
        <StyledWrapper>
          <Alert id="alert-no-prs" variant="info">
            {personsData.persons.length === 0
              ? t('textNoPersons')
              : t('textNoProcessingRecords')}
          </Alert>
        </StyledWrapper>
      )}
      <Pagination
        hasNextPage={rows.length > pageNumber * pageLimit}
        isPreviousData={false}
        isLoading={isLoading}
        totalPages={totalPages}
      />
      <PersonModal
        person={personModalData?.person}
        participantInfos={personModalData?.participantInfos}
        onClose={() => setPersonModalData(null)}
        onClickCreatePr={() => {
          if (!personModalData) return;
          setPrModalData([
            {
              person: personModalData.person,
              participantInfos: personModalData.participantInfos || [],
              records: [],
            },
          ]);
          setPersonModalData(null);
        }}
        showCreatePr={!dcOrDpSuspended}
      />
      {dc && (
        <ProcessingRecordModal
          dc={dc}
          personsAndRecords={prModalData}
          metadatas={metadatas}
          onClose={() => setPrModalData([])}
          onCreateSuccess={() => {
            setIsSelectActivated(false);
            queryClient.invalidateQueries(prQueryKey); // TODO: Invalidate only affected rows
            queryClient.invalidateQueries(membersQueryKey);
          }}
        />
      )}
      <EmailNotificationModal
        personsAndRecords={emailModalData}
        metadatas={metadatas}
        onClose={() => setEmailModalData([])}
      />
      <WithdrawModal
        personsAndRecords={withdrawModalData}
        metadatas={metadatas}
        onClose={() => setWithdrawModalData([])}
        onWithdrawSuccess={() => {
          setIsSelectActivated(false);
          setWithdrawModalData([]);
          queryClient.invalidateQueries(prQueryKey); // TODO: Invalidate only affected rows
        }}
      />
    </>
  );
};

export default Members;

/* Helpers */

const pageLimit = 20;

const filterPersonsAndRecords = (
  personsAndRecords: PersonWithRecords[],
  filters: ProcessingRecordFilters
) => {
  if (filters.all) {
    return personsAndRecords;
  }
  return personsAndRecords.filter(({ person, records }) => {
    if (records.length === 0) {
      if (filters.notTargeted) {
        return true;
      }
    } else {
      const record = records[0];
      if (filters[record.status]) {
        return true;
      }
      if (!person) {
        if (filters.notInTargetGroup) {
          return true;
        }
      }
    }
    return false;
  });
};

const getStats = (personsAndRecords: PersonWithRecords[]) =>
  personsAndRecords.reduce(
    (acc, row) => {
      const { person, records } = row;
      let key: keyof ProcessingRecordFilterStats = 'notTargeted';
      acc.all.push(row);
      if (records.length > 0) {
        key = records[0].status;
        acc.targeted.push(row);
        if (!person) {
          acc.notInTargetGroup.push(row);

          // Add a new property "notInTargetGroup" to records so that we can later look at a PR and
          // determine from that whether the data subject belonged to a group or not.
          records.forEach((r) => {
            // eslint-disable-next-line no-param-reassign
            r.notInTargetGroup = true;
          });
        }
      }
      if (!(key in acc)) {
        acc[key] = [];
      }
      acc[key].push(row);
      return acc;
    },
    {
      all: [],
      targeted: [],
      notTargeted: [],
      notInTargetGroup: [],
      active: [],
      declined: [],
      expired: [],
      pending: [],
      suspended: [],
      withdrawn: [],
    } as ProcessingRecordFilterStats
  );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const combineExtAPIResponses = (pages: Record<string, any>[]) => {
  if (!pages?.length) return {};
  const combined = { ...pages[0] };
  if (pages.length === 1) return combined;
  pages.slice(1).forEach((currentPage) => {
    Object.entries(currentPage).forEach(([resourceName, resources]) => {
      if (Array.isArray(resources)) {
        if (!(resourceName in combined)) combined[resourceName] = [];
        combined[resourceName] = combined[resourceName].concat([...resources]);
      } else if (typeof resources === 'object' && resources) {
        if (!(resourceName in combined)) combined[resourceName] = {};
        Object.assign(combined[resourceName], resources);
      }
    });
  });
  return combined;
};

const combinePersonsAndRecords = (
  persons: Person[],
  recordsResponse: ProcessingRecordsResponse,
  activationMode: ActivationMode
) => {
  const addParticipantInfos =
    activationMode !== ActivationMode.DATA_SUBJECT_ACTIVATES;

  // Bake in a "participants" property inside each ProcessingRecord for easy access to
  // ProcessingRecordParticipant objects.
  const matchedRecordUuids: string[] = [];
  const allRecordsWithParticipants: Record<
    string,
    ProcessingRecordWithParticipants
  > = addParticipantsArrayToRecords(recordsResponse);
  const personsAndRecords: {
    records: ProcessingRecordWithParticipants[];
    person: Person | null;
    participantInfos: ParticipantInfo[];
  }[] = persons
    // Filter out persons that don't have identifiers
    // TODO: Do we want to show these too and somehow indicate lack of identifiers?
    .filter(
      (person) =>
        Array.isArray(person?.identifiers) && person.identifiers.length > 0
    )
    .map((person) => {
      const recordsForPerson = Object.values(allRecordsWithParticipants)
        .filter((record) => {
          // We only need to match a person to a ProcessingRecord's data_subject roled participant
          // since it defines the uniqueness of a PR regardless of other participants.
          const dataSubjectParticipant = record.participants.find(
            (prp) => prp.role === ParticipantRole.DATA_SUBJECT
          );
          if (!dataSubjectParticipant) return false;
          const dataSubjectIdentifier =
            recordsResponse.identifiers[dataSubjectParticipant.identifier_uuid];
          const recordIdType =
            recordsResponse.id_types[dataSubjectIdentifier.id_type_uuid];
          const matchingDataSubjectIdentifier = person.identifiers.find(
            (personId) => {
              const idTypeMatches =
                camelToSnake(personId.type) === recordIdType.type;
              const countryMatches =
                recordIdType.type !== 'ssn' ||
                (personId.country &&
                  alpha2ToAlpha3(personId.country) === recordIdType.country);
              const idMatches = personId.id === dataSubjectIdentifier.id;
              return idTypeMatches && idMatches && countryMatches;
            }
          );
          if (matchingDataSubjectIdentifier) {
            matchedRecordUuids.push(record.uuid);
            return true;
          }
          return false;
        })
        // There can exist multiple ProcessingRecords, but we only want to show one PR per person
        // in the listing. Multiple PRs can be in terminal statuses, but only one can be in an
        // "interactive" state at a time, and that is the one we want to show. If all of them are
        // in a terminal status, show the one that is most recently created.
        // We sort the PRs for a person, so that the first one in the array is the one to show in UI
        .sort(sortByInteractiveRecord);

      const hasRecords = recordsForPerson.length > 0;
      const participantInfos = addParticipantInfos
        ? getNonDataSubjectParticipantInfos(
            person,
            hasRecords ? recordsForPerson[0] : null,
            hasRecords ? recordsForPerson[0].participants : null
          )
        : [];
      return { person, records: recordsForPerson, participantInfos };
    });
  const allRecordUuids = Object.keys(recordsResponse.processing_records);
  const unmatchedRecords = allRecordUuids.filter(
    (record) => !matchedRecordUuids.includes(record)
  );
  return personsAndRecords.concat(
    unmatchedRecords.map((uuid) => {
      const r = allRecordsWithParticipants[uuid];
      return {
        person: null,
        records: [r],
        participantInfos: addParticipantInfos
          ? getNonDataSubjectParticipantInfos(null, r, r.participants)
          : [],
      };
    })
  );
};

const sortByInteractiveRecord = (
  a: ProcessingRecordWithParticipants,
  b: ProcessingRecordWithParticipants
) => {
  if (
    !NON_TERMINAL_STATUSES.includes(a.status) &&
    !NON_TERMINAL_STATUSES.includes(b.status)
  ) {
    return new Date(a.created) <= new Date(b.created) ? 1 : -1;
  }
  return getRecordStatusSortKey(a.status, b.status);
};

const sortedRows = (personsAndRecords: PersonWithRecords[]) =>
  [...personsAndRecords].sort(
    ({ records: aRecords }, { records: bRecords }) => {
      if (
        (aRecords.length > 0 && bRecords.length === 0) ||
        (aRecords.length === 0 && bRecords.length === 0)
      ) {
        return -1;
      }
      if (aRecords.length === 0 && bRecords.length > 0) {
        return 1;
      }
      return getRecordStatusSortKey(aRecords[0].status, bRecords[0].status);
    }
  );

const usePruneOrphanedSelections = (
  allRowsById: Record<string, RowData>,
  selectedItems: string[],
  setSelectedItems: (_: string[]) => void
) => {
  useEffect(() => {
    if (selectedItems.length > 0) {
      const notOrphanedSelectedItems: string[] = [];
      const orphanedSelectedItems = [];
      selectedItems.forEach((id) => {
        if (id in allRowsById) notOrphanedSelectedItems.push(id);
        else orphanedSelectedItems.push(id);
      });
      if (orphanedSelectedItems.length > 0)
        setSelectedItems(notOrphanedSelectedItems);
    }
  }, [allRowsById, selectedItems, setSelectedItems]);
};

/* Styled Components */

const StyledWrapper = styled.div`
  margin-top: 2em;
`;

const StyledAlert = styled(Alert)`
  margin: 1em 0;
`;

interface TableWrapperProps {
  $selectActivated: boolean;
}

const StyledTableWrapper = styled.div<TableWrapperProps>`
  margin-left: ${(p) => (p.$selectActivated ? '3em' : '0')};
`;

const StyledCellSelectIndicator = styled.div`
  position: absolute;
  display: flex;
  left: -3em;
  top: 0;
  height: 100%;
  span {
    ::after {
      top: calc(50% - 0.625em);
    }
    ::before {
      top: calc(50% - 0.875em);
    }
  }
`;
