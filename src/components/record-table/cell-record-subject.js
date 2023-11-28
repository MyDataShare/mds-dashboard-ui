import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import IconText from 'components/icon-text';
import SensitiveField from 'components/sensitive-field';
import theme from 'theme';
import { ParticipantRole } from 'types/enums';
import { extractEmailFromContactDetails } from 'util/general';
import { formatUsername } from 'util/mds-api';
import {
  ProcessingRecordProp,
  PersonProp,
  IdentifierProp,
} from 'util/prop-types';

const CellRecordSubject = ({ record, person, identifiers, showIdentifier }) => {
  // NOTE: 'record' is assumed to contain a property 'participants' which is an array of the
  // record's ProcessingRecordParticipants
  const { t } = useTranslation();
  let email = null;
  let name = null;
  let hasNoIdentifiers = false;
  let identifierValue = null;
  let notInTargetGroup = false;
  if (record) {
    if (record.participants) {
      const dataSubject = record.participants.find(
        (prp) =>
          prp.processing_record_uuid === record.uuid &&
          prp.role === ParticipantRole.DATA_SUBJECT
      );
      name = dataSubject.identifier_display_name;
      email = dataSubject.notification_email_address;
      identifierValue = identifiers
        ? identifiers[dataSubject.identifier_uuid]?.id
        : null;
    }
    if (record.notInTargetGroup) {
      notInTargetGroup = true;
    }
  }
  if (person) {
    if (!email) {
      email = extractEmailFromContactDetails(person);
    }
    if (!name) {
      name = formatUsername({
        givenName: person.first_names,
        familyName: person.family_names,
      });
    }
    if (!record && (!person.identifiers || person.identifiers.length === 0)) {
      hasNoIdentifiers = true;
    }
  }
  return (
    <StyledWrapper>
      <div>{name || <i>{t('labelNameNotAvailable')}</i>}</div>
      {email && (
        <StyledColoredText $color={theme.grey700}>{email}</StyledColoredText>
      )}
      {(showIdentifier || (!name && !email)) && identifierValue && (
        <SensitiveField>{identifierValue}</SensitiveField>
      )}
      {notInTargetGroup && (
        <StyledDeEmphasis>
          <StyledColoredText $color={theme.vgOrange}>
            <IconText
              icon={
                <FontAwesomeIcon
                  icon={icon({ name: 'triangle-exclamation' })}
                />
              }
              text={t('labelPersonNotInTargetGroup')}
            />
          </StyledColoredText>
        </StyledDeEmphasis>
      )}
      {hasNoIdentifiers && (
        <StyledDeEmphasis>
          <StyledColoredText $color={theme.vgOrange}>
            <IconText
              icon={
                <FontAwesomeIcon
                  icon={icon({ name: 'triangle-exclamation' })}
                />
              }
              text={t('labelPersonHasNoIdentifiers')}
            />
          </StyledColoredText>
        </StyledDeEmphasis>
      )}
    </StyledWrapper>
  );
};

CellRecordSubject.propTypes = {
  record: ProcessingRecordProp,
  person: PersonProp,
  identifiers: PropTypes.objectOf(IdentifierProp),
  showIdentifier: PropTypes.bool,
};

CellRecordSubject.defaultProps = {
  record: null,
  person: null,
  identifiers: null,
  showIdentifier: false,
};

export default CellRecordSubject;

/* Styled Components */

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledDeEmphasis = styled.div.attrs({ className: 'de-emphasis' })`
  font-size: 0.875em;
  color: ${(props) => props.theme.grey700};
`;

const StyledColoredText = styled.div`
  color: ${(props) => props.$color};
`;
