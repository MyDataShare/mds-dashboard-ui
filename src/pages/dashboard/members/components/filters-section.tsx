import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Accordion from 'components/accordion';
import Chip from 'components/chip';
import { usePagination } from 'hooks';
import { ProcessingRecordFilters, ProcessingRecordFilterStats } from 'types';
import { RecordStatus } from 'types/enums';
import {
  getRecordStatusIcon,
  getRecordStatusSortKey,
  STATUS_SORT_ORDER,
} from 'util/processing-record';
import { capitalize } from 'util/string';

// TODO: When taking filters into use in another view, extract and encapsulate filtering related
//       stuff better. Now these are a bit all over the place and there's members-view specific
//       logic. Also make a hook from the state in members/index.js

type SetUiFilters = (_: ProcessingRecordFilters) => void;

interface Props {
  stats: ProcessingRecordFilterStats;
  uiFilters: ProcessingRecordFilters;
  setUiFilters: SetUiFilters;
}

const FiltersSection = ({ stats, uiFilters, setUiFilters }: Props) => {
  const { t } = useTranslation();
  const { changePage } = usePagination();
  const sortedStatsKeys: (keyof ProcessingRecordFilterStats)[] = [
    ...Object.keys(stats),
  ].sort((a, b) =>
    getRecordStatusSortKey(a, b)
  ) as unknown as (keyof ProcessingRecordFilterStats)[];
  const onFilter = useCallback(
    (key: keyof ProcessingRecordFilters) =>
      setFilter(key, uiFilters, setUiFilters, changePage),
    [changePage, setUiFilters, uiFilters]
  );
  const onFilterAll = () => setFilterAll(setUiFilters, changePage);

  useEffect(() => {
    // This removes a selected filter if there are no items matching it. Can happen e.g. when
    // user has selected some filters but then new API data is fetched and in it the selected filter
    // category is empty.
    Object.entries(uiFilters)
      .filter(([, v]) => !!v)
      .forEach(([filter]) => {
        if (!Array.isArray(stats[filter as keyof ProcessingRecordFilters])) {
          onFilter(filter as keyof ProcessingRecordFilters);
        }
      });
  }, [onFilter, stats, uiFilters]);

  return (
    <StyledFiltersSection>
      <Accordion
        showToggle
        titleComponent={
          <StyledFiltersHeading>{t('labelSortAndFilter')}</StyledFiltersHeading>
        }
      >
        <StyledWrapper>
          {/* <StyledLabel>{t('labelSort')}</StyledLabel> */}
          {/* <Dropdown id="dropdown-sort" text="Luvituksen" showBorder normalWeightValue> */}
          {/*  <Dropdown.Item text="Sukunimen mukaan" /> */}
          {/* </Dropdown> */}
          {/* <StyledWrapper> */}
          {/*  <StyledLabel>{t('labelFilter')}</StyledLabel> */}
          {/* </StyledWrapper> */}
          <Chip.Area>
            {sortedStatsKeys
              .filter(
                (statKey) => statKey !== 'targeted' && stats[statKey].length > 0
              )
              .map((statKey) => {
                const Icon = STATUS_SORT_ORDER.includes(statKey)
                  ? getRecordStatusIcon(statKey as RecordStatus)
                  : null;
                const onClick =
                  statKey === 'all' ? onFilterAll : () => onFilter(statKey);
                const selected = uiFilters[statKey];
                return (
                  <Chip
                    key={statKey}
                    selectable
                    selected={selected}
                    onClick={onClick}
                  >
                    {Icon}
                    {t(`label${capitalize(statKey)}`)} ({stats[statKey].length})
                  </Chip>
                );
              })}
          </Chip.Area>
        </StyledWrapper>
      </Accordion>
    </StyledFiltersSection>
  );
};

export default FiltersSection;

/* Helpers */

const setFilter = (
  key: keyof ProcessingRecordFilters,
  uiFilters: ProcessingRecordFilters,
  setUiFilters: SetUiFilters,
  changePage: (_: number) => void
) => {
  const newFilters = { ...uiFilters, all: false };
  newFilters[key] = !newFilters[key];
  const activeFilters = Object.entries(newFilters).filter(
    ([k, v]) => k !== 'all' && !!v
  );
  if (activeFilters.length === 0) {
    newFilters.all = true;
  }
  setUiFilters(newFilters);
  changePage(1);
};

const setFilterAll = (
  setUiFilters: SetUiFilters,
  changePage: (_: number) => void
) => {
  setUiFilters({
    all: true,
    notTargeted: false,
    notInTargetGroup: false,
    targeted: false,
    active: false,
    declined: false,
    pending: false,
    suspended: false,
    expired: false,
    withdrawn: false,
  });
  changePage(1);
};

/* Styled Components */

const StyledWrapper = styled.div`
  margin-top: 2em;
`;

const StyledFiltersSection = styled.div`
  margin: 2em 0 0.75em 0;
`;

const StyledFiltersHeading = styled.h4`
  margin: 0;
`;
