import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Alert from 'components/alert';
import Button from 'components/button';
import LabeledValue from 'components/labeled-value';
import Modal from 'components/modal';
import CellRecordParticipants from 'components/record-table/cell-record-participants';
import CellRecordSubject from 'components/record-table/cell-record-subject';
import StyledButtonArea from 'pages/dashboard/members/components/styled-button-area';
import { PersonProp, ParticipantInfoProp } from 'util/prop-types';

const PersonModal = ({
  person,
  participantInfos,
  onClose,
  onClickCreatePr,
  showCreatePr,
}) => {
  const { t } = useTranslation();
  if (!person || !participantInfos) return null;
  const missingParticipantIdentifiers = !!participantInfos.find(
    (info) => !!info.hasNoIdentifiers
  );
  return (
    <Modal showCloseButton onClose={onClose} title={t('headingPersonInfo')}>
      <StyledAlert variant={missingParticipantIdentifiers ? 'warning' : 'info'}>
        {missingParticipantIdentifiers
          ? t('textPersonMissingIdentifiersAlert')
          : t('textPersonWithoutPrAlert')}
      </StyledAlert>
      <LabeledValue
        label={t('labelPerson')}
        value={<CellRecordSubject person={person} />}
      />
      {participantInfos && participantInfos.length > 0 && (
        <LabeledValue
          label={t('labelParticipants')}
          value={<CellRecordParticipants participantInfos={participantInfos} />}
        />
      )}
      <StyledButtonArea>
        {showCreatePr && (
          <Button
            size="small"
            variant="text"
            text={t('labelCreateProcessingRecord')}
            icon={<FontAwesomeIcon icon={icon({ name: 'plus' })} />}
            onClick={onClickCreatePr}
            disabled={missingParticipantIdentifiers}
          />
        )}
        <Button
          size="small"
          variant="secondary"
          text={t('labelClose')}
          onClick={onClose}
        />
      </StyledButtonArea>
    </Modal>
  );
};

PersonModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onClickCreatePr: PropTypes.func.isRequired,
  showCreatePr: PropTypes.bool.isRequired,
  person: PersonProp,
  participantInfos: PropTypes.arrayOf(ParticipantInfoProp),
};

PersonModal.defaultProps = {
  person: null,
  participantInfos: null,
};

export default PersonModal;

/* StyledComponents */

const StyledAlert = styled(Alert)`
  margin: 1em 0;
`;
