import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { patchProcessingRecord } from 'api/modify';
import Alert from 'components/alert';
import Button from 'components/button';
import Checkbox from 'components/checkbox';
import Modal from 'components/modal';
import PersonAccordion from 'components/person-accordion';
import ResultModal from 'components/result-modal';
import SpinnerIcon from 'components/spinner-icon';
import StyledButtonArea from 'pages/dashboard/members/components/styled-button-area';
import { RecordStatus } from 'types/enums';
import { chunkify } from 'util/array';
import { NON_TERMINAL_STATUSES } from 'util/processing-record';
import { PersonRecordProp } from 'util/prop-types';

const WithdrawModal = ({
  personsAndRecords,
  metadatas,
  onClose,
  onWithdrawSuccess,
}) => {
  const { t } = useTranslation();
  const [confirmChecked, setConfirmChecked] = useState(false);

  useEffect(() => {
    // When closing the modal, reset checked state
    if (personsAndRecords.length === 0) setConfirmChecked(false);
  }, [personsAndRecords.length]);

  const withdrawRecordMutation = useMutation(async (targets) =>
    Promise.all(
      chunkify(targets, 100).map(async (targetsChunk) => {
        const payload = {
          processingRecord: targetsChunk.map(({ records }) => records[0]),
          payload: {
            processingRecord: { terminal_status: RecordStatus.WITHDRAWN },
          },
        };
        return patchProcessingRecord(payload);
      })
    )
  );

  if (personsAndRecords.length === 0) return null;

  const withdrawableRows = [];
  const notWithdrawableRows = [];
  personsAndRecords.forEach((row) => {
    const { records } = row;
    if (records.length === 0) {
      notWithdrawableRows.push(row);
    } else {
      const isTerminalState = !NON_TERMINAL_STATUSES.includes(
        records[0].status
      );
      if (isTerminalState) {
        notWithdrawableRows.push(row);
      } else {
        withdrawableRows.push(row);
      }
    }
  });
  const onCloseResultModal = () => {
    if (withdrawRecordMutation.isSuccess) {
      onWithdrawSuccess();
    }
    withdrawRecordMutation.reset();
    return onClose();
  };
  if (withdrawRecordMutation.isSuccess || withdrawRecordMutation.isError) {
    const textParams = { count: withdrawableRows.length };
    return (
      <ResultModal
        onClose={onCloseResultModal}
        isDismissable={!withdrawRecordMutation.isLoading}
        isSuccess={withdrawRecordMutation.isSuccess}
        heading={t(
          `headingRecordWithdraw${
            withdrawRecordMutation.isSuccess ? 'Success' : 'Error'
          }`,
          textParams
        )}
        text={t(
          `textRecordWithdraw${
            withdrawRecordMutation.isSuccess ? 'Success' : 'Error'
          }`,
          textParams
        )}
      />
    );
  }
  return (
    <Modal
      showCloseButton
      onClose={onClose}
      isDismissable={!withdrawRecordMutation.isLoading}
      title={t('headingWithdrawRecords')}
    >
      <p>{t('textConfirmWithdrawRecordsIntro')}</p>
      <StyledAlert
        variant="warning"
        heading={t('headingWithdrawRecordsWarning')}
      >
        <p>{t('textWithdrawRecordsWarning')}</p>
      </StyledAlert>
      <PersonAccordion
        personsAndRecords={withdrawableRows}
        metadatas={metadatas}
        heading={t('headingWithdrawRecordsTargets', {
          count: withdrawableRows.length,
        })}
        collapsed={false}
      />
      {notWithdrawableRows.length > 0 && (
        <PersonAccordion
          personsAndRecords={notWithdrawableRows}
          metadatas={metadatas}
          heading={t('headingWithdrawRecordsTargetsSkipped', {
            count: notWithdrawableRows.length,
          })}
          info={t('textWithdrawRecordsTargetsSkippedInfo')}
        />
      )}
      <StyledWrapper>
        <p>{t('textConfirmWithdrawCheckbox')}</p>
        <StyledConfirmWithdrawCheckbox
          id="checkbox-confirm-withdraw"
          checked={confirmChecked}
          onClick={() => setConfirmChecked(!confirmChecked)}
          withoutForm
        >
          {t('labelConfirmWithdraw')}
        </StyledConfirmWithdrawCheckbox>
      </StyledWrapper>
      <StyledButtonArea>
        <Button
          size="small"
          variant="secondary"
          text={t('labelCancel')}
          onClick={onClose}
          disabled={withdrawRecordMutation.isLoading}
        />
        <Button
          variant="primary"
          colorVariant="negative"
          size="small"
          id="btn-modal-withdraw"
          text={t('labelWithdraw')}
          icon={
            withdrawRecordMutation.isLoading ? (
              <SpinnerIcon />
            ) : (
              <FontAwesomeIcon icon={icon({ name: 'box-archive' })} />
            )
          }
          disabled={!confirmChecked || withdrawRecordMutation.isLoading}
          onClick={() => withdrawRecordMutation.mutate(withdrawableRows)}
        />
      </StyledButtonArea>
    </Modal>
  );
};

WithdrawModal.propTypes = {
  personsAndRecords: PropTypes.arrayOf(PersonRecordProp).isRequired,
  metadatas: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
  onWithdrawSuccess: PropTypes.func.isRequired,
};

export default WithdrawModal;

/* Styled Components */

const StyledAlert = styled(Alert)`
  margin: 1em 0;
`;

const StyledWrapper = styled.div`
  margin-top: 2em;
`;

const StyledConfirmWithdrawCheckbox = styled(Checkbox)`
  margin: 0;
`;
