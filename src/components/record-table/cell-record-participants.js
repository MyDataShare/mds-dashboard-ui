import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import IconText from 'components/icon-text';
import theme from 'theme';
import { getRecordStatusIcon } from 'util/processing-record';
import { ParticipantInfoProp } from 'util/prop-types';

const CellRecordParticipants = ({ participantInfos, compact }) => {
  const { t } = useTranslation();
  if (!participantInfos) return null;
  if (participantInfos.length > 2 && compact) {
    return (
      <StyledWrapper>
        <Participant {...participantInfos[0]} />
        <StyledMoreIndicator>
          {t('textMoreParticipants', { count: participantInfos.length - 1 })}
        </StyledMoreIndicator>
      </StyledWrapper>
    );
  }
  return (
    <StyledWrapper>
      {participantInfos.map((info) => (
        <Participant key={info.id} {...info} />
      ))}
    </StyledWrapper>
  );
};

CellRecordParticipants.propTypes = {
  participantInfos: PropTypes.arrayOf(ParticipantInfoProp),
  compact: PropTypes.bool,
};

CellRecordParticipants.defaultProps = {
  participantInfos: null,
  compact: false,
};

const Participant = ({ email, name, status, hasNoIdentifiers }) => {
  const { t } = useTranslation();
  return (
    <StyledParticipantWrapper>
      {status && name ? (
        <IconText text={name} icon={getRecordStatusIcon(status)} />
      ) : (
        name || <i>{t('labelNameNotAvailable')}</i>
      )}
      {email && (
        <StyledEmail $color={theme.grey700} $indent={status && name}>
          {email}
        </StyledEmail>
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
    </StyledParticipantWrapper>
  );
};

Participant.propTypes = {
  email: PropTypes.string,
  name: PropTypes.string,
  status: PropTypes.string,
  hasNoIdentifiers: PropTypes.bool,
};

Participant.defaultProps = {
  email: null,
  name: null,
  status: null,
  hasNoIdentifiers: false,
};

export default CellRecordParticipants;

/* Styled Components */

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledEmail = styled.div`
  color: ${(props) => props.$color};
  margin: ${(p) => (p.$indent ? '-0.25em 0 0 1.75em' : '-0.25em 0 0 0')};
`;

const StyledParticipantWrapper = styled.div`
  & + & {
    margin: 0.5em 0 0 0;
  }
`;

const StyledDeEmphasis = styled.div.attrs({ className: 'de-emphasis' })`
  font-size: 0.875em;
  color: ${(props) => props.theme.grey700};
`;

const StyledColoredText = styled.div`
  color: ${(props) => props.$color};
`;

const StyledMoreIndicator = styled.div`
  margin-top: 0.5em;
  color: ${(props) => props.theme.grey700};
  font-weight: ${(props) => props.theme.fontSemiBold};
`;
