import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/button';
import Checkbox from 'components/checkbox';
import { getPersonRowKey } from 'pages/dashboard/members/util';
import { PersonRecordProp } from 'util/prop-types';

const SelectControls = ({
  isSelectActivated,
  setIsSelectActivated,
  selectedItems,
  selectAllItems,
  clearSelections,
  filteredPersonsAndRecords,
}) => {
  const { t } = useTranslation();
  const isSelectAllChecked = areAllFilteredRowsSelected(
    selectedItems,
    filteredPersonsAndRecords
  );
  return (
    <StyledSelectWrapper>
      <Button
        text={isSelectActivated ? t('labelCancelSelect') : t('labelSelect')}
        variant="text"
        onClick={() => setIsSelectActivated(!isSelectActivated)}
      />
      {isSelectActivated && (
        <>
          <div>{t('labelSelectedCount', { count: selectedItems.length })}</div>
          <StyledSelectInlineWrapper>
            <Checkbox
              withoutForm
              name="checkbox-select-all"
              id="checkbox-select-all"
              onClick={() => {
                if (isSelectAllChecked) return clearSelections();
                return selectAllItems(
                  filteredPersonsAndRecords,
                  getPersonRowKey
                );
              }}
              checked={isSelectAllChecked}
            >
              {t('labelSelectAll')}
            </Checkbox>
          </StyledSelectInlineWrapper>
        </>
      )}
    </StyledSelectWrapper>
  );
};

SelectControls.propTypes = {
  isSelectActivated: PropTypes.bool.isRequired,
  setIsSelectActivated: PropTypes.func.isRequired,
  selectedItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectAllItems: PropTypes.func.isRequired,
  filteredPersonsAndRecords: PropTypes.arrayOf(PersonRecordProp).isRequired,
  clearSelections: PropTypes.func.isRequired,
};

export default SelectControls;

/* Helpers */

const areAllFilteredRowsSelected = (selectedItems, filteredPersonsAndRecords) =>
  filteredPersonsAndRecords.every((personAndRecords) =>
    selectedItems.includes(getPersonRowKey(personAndRecords))
  );

/* StyledComponents */

const StyledSelectWrapper = styled.div`
  margin: 2em 0 0 0;
  label {
    margin: 0;
  }
  button {
    width: auto;
  }
`;

const StyledSelectInlineWrapper = styled.div`
  display: flex;
  gap: 2.5em;
  align-items: center;
  margin-top: 0.75em;
`;
