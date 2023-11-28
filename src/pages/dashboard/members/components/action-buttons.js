import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/button';
import { useAuth } from 'context/auth';
import StyledButtonArea from 'pages/dashboard/members/components/styled-button-area';
import { ActivationMode } from 'types/enums';
import { getEmailGateway, isNotifiable } from 'util/mds-api';
import { NON_TERMINAL_STATUSES } from 'util/processing-record';
import {
  DataConsumerProp,
  PersonRecordProp,
  RecordStatsProp,
} from 'util/prop-types';

const ActionButtons = ({
  stats,
  allRowsById,
  dc,
  selectedItems,
  setPrModalData,
  setEmailModalData,
  setWithdrawModalData,
  suspended,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const emailGateway = getEmailGateway(user);

  const selectedRows = useMemo(
    () =>
      selectedItems
        .filter((id) => id in allRowsById)
        .map((id) => allRowsById[id]),
    [selectedItems, allRowsById]
  );

  const selectedTargetableRows = useMemo(
    () => getTargetableRows(selectedRows, dc.activation_mode),
    [dc.activation_mode, selectedRows]
  );

  const allTargetableRows = useMemo(
    () => getTargetableRows(stats.notTargeted, dc.activation_mode),
    [dc.activation_mode, stats.notTargeted]
  );

  const selectedNotifiableRows = useMemo(() => {
    if (!emailGateway) return [];
    return getNotifiableRows(selectedRows, user, dc);
  }, [emailGateway, selectedRows, user, dc]);

  const allNotifiableRows = useMemo(() => {
    if (!emailGateway) return [];
    return getNotifiableRows(stats.targeted, user, dc);
  }, [dc, emailGateway, stats.targeted, user]);

  const selectedWithdrawableRows = useMemo(
    () => getWithdrawableRows(selectedRows),
    [selectedRows]
  );

  const allWithdrawableRows = useMemo(
    () => getWithdrawableRows(stats.targeted),
    [stats]
  );

  const commonProps = { variant: 'secondary', size: 'small' };
  const createText =
    selectedRows.length > 0
      ? t('labelCreateProcessingRecordsToSelected', {
          count: selectedTargetableRows.length,
        })
      : t('labelCreateProcessingRecordsToAll', {
          count: allTargetableRows.length,
        });
  return (
    <StyledButtonArea justify="start">
      {!suspended && (
        <Button
          {...commonProps}
          id="btn-create-prs"
          text={createText}
          icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
          disabled={
            (selectedRows.length > 0 && selectedTargetableRows.length === 0) ||
            allTargetableRows.length === 0
          }
          onClick={() => {
            // If select mode is not on, pass only untargeted rows to PR create modal.
            // If there are selections, pass them all to PR modal, so it can show to the user that
            // some selections are going to be omitted from PR create since they already have PRs.
            const prModalRows =
              selectedRows.length > 0 ? selectedRows : allTargetableRows;
            setPrModalData(prModalRows);
          }}
        />
      )}
      {!suspended && emailGateway && (
        <Button
          {...commonProps}
          id="btn-send-reminders"
          text={
            selectedRows.length > 0
              ? t('labelSendRemindersToSelected', {
                  count: selectedNotifiableRows.length,
                })
              : t('labelSendRemindersToAll', {
                  count: allNotifiableRows.length,
                })
          }
          icon={<FontAwesomeIcon icon={icon({ name: 'bell' })} />}
          disabled={
            (selectedRows.length > 0 && selectedNotifiableRows.length === 0) ||
            allNotifiableRows.length === 0
          }
          onClick={() => {
            const emailModalRows =
              selectedRows.length > 0 ? selectedRows : allNotifiableRows;
            setEmailModalData(emailModalRows);
          }}
        />
      )}
      <Button
        {...commonProps}
        id="btn-withdraw-prs"
        colorVariant="negative"
        text={
          selectedRows.length > 0
            ? t('labelWithdrawSelected', {
                count: selectedWithdrawableRows.length,
              })
            : t('labelWithdrawAll', { count: allWithdrawableRows.length })
        }
        icon={<FontAwesomeIcon icon={icon({ name: 'box-archive' })} />}
        disabled={
          (selectedRows.length > 0 && selectedWithdrawableRows.length === 0) ||
          allWithdrawableRows.length === 0
        }
        onClick={() => {
          const withdrawRows =
            selectedRows.length > 0 ? selectedRows : allWithdrawableRows;
          setWithdrawModalData(withdrawRows);
        }}
      />
    </StyledButtonArea>
  );
};

ActionButtons.propTypes = {
  stats: RecordStatsProp.isRequired,
  allRowsById: PropTypes.objectOf(PersonRecordProp).isRequired,
  dc: DataConsumerProp.isRequired,
  selectedItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  setPrModalData: PropTypes.func.isRequired,
  setEmailModalData: PropTypes.func.isRequired,
  setWithdrawModalData: PropTypes.func.isRequired,
  suspended: PropTypes.bool.isRequired,
};

export default ActionButtons;

/* Helpers */

// TODO: Change "getTargetableRows" to return two arrays: targetable, notTargetable.
//       Also change other similar functions?
const getTargetableRows = (personsAndRecords, activationMode) =>
  personsAndRecords.filter(({ person, records }) => {
    if (records.length > 0 || !person) {
      return false;
    }
    if (person.identifiers.length === 0) {
      return false;
    }
    if (
      ![
        ActivationMode.ALL_ACTIVATORS_ACTIVATE,
        ActivationMode.ANY_ACTIVATOR_ACTIVATES,
      ].includes(activationMode)
    ) {
      return true;
    }
    let hasGuardianWithoutIdentifiers = false;
    person.guardians?.forEach((guardian) => {
      if (!guardian?.identifiers || guardian.identifiers.length === 0) {
        hasGuardianWithoutIdentifiers = true;
      }
    });
    return !hasGuardianWithoutIdentifiers;
  });

const getNotifiableRows = (personsAndRecords, user, dc) =>
  personsAndRecords.filter(({ records }) => {
    if (records.length === 0) return false;
    return isNotifiable(user, dc, records[0], records[0].participants);
  });

const getWithdrawableRows = (personsAndRecords) =>
  personsAndRecords.filter(({ records }) => {
    if (records.length === 0) return false;
    return NON_TERMINAL_STATUSES.includes(records[0].status);
  });
