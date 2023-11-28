import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import IconText from 'components/icon-text';
import LabeledValue from 'components/labeled-value';
import theme from 'theme';
import { RecordStatus, RecordType } from 'types/enums';
import { formatDate } from 'util/date';
import { getLatestParticipantNotification } from 'util/mds-api';
import { getRecordStatusIcon } from 'util/processing-record';
import {
  MetadataProp,
  ProcessingRecordParticipantProp,
  ProcessingRecordProp,
} from 'util/prop-types';

const CellRecordStatus = ({
  record,
  participants,
  metadatas,
  className,
  compact,
}) => {
  const { t } = useTranslation();
  const { date, status, statusColor, statusIcon, anyNotificationFailed } =
    buildRecordStatusCell(record, participants, metadatas, t);
  const StatusComponent = (
    <IconText
      text={
        <StyledColoredText $color={statusColor}>{status}</StyledColoredText>
      }
      icon={statusIcon}
    />
  );
  return (
    <StyledStatusWrapper className={className}>
      {compact ? (
        <LabeledValue label={t('status')} value={StatusComponent} />
      ) : (
        <>
          <StyledDeEmphasis>{date}</StyledDeEmphasis>
          {StatusComponent}
        </>
      )}
      {!compact && (
        <StyledWarningsWrapper>
          {record?.expires && record.status !== RecordStatus.EXPIRED && (
            <StyledDeEmphasis>
              <StyledColoredText $color={theme.vgOrange}>
                {t('labelExpiresOn', {
                  date: formatDate(record.expires, false),
                })}
              </StyledColoredText>
            </StyledDeEmphasis>
          )}
          {anyNotificationFailed && (
            <StyledDeEmphasis>
              <StyledColoredText $color={theme.vgOrange}>
                <IconText
                  icon={
                    <FontAwesomeIcon
                      icon={icon({ name: 'triangle-exclamation' })}
                    />
                  }
                  text={t('labelParticipantEmailError')}
                />
              </StyledColoredText>
            </StyledDeEmphasis>
          )}
        </StyledWarningsWrapper>
      )}
    </StyledStatusWrapper>
  );
};

CellRecordStatus.propTypes = {
  record: ProcessingRecordProp,
  participants: PropTypes.arrayOf(ProcessingRecordParticipantProp),
  metadatas: PropTypes.arrayOf(MetadataProp),
  className: PropTypes.string,
  compact: PropTypes.bool,
};

CellRecordStatus.defaultProps = {
  record: null,
  participants: [],
  metadatas: null,
  className: null,
  compact: false,
};

export default CellRecordStatus;

/* Helpers */

export const buildRecordStatusCell = (pr, participants, metadatas, t) => {
  const statusColor = '#00000';
  const defaultRet = {
    date: null,
    statusIcon: getRecordStatusIcon('notTargeted'),
    statusColor,
    anyNotificationFailed: false,
  };
  if (pr) {
    defaultRet.status = t(pr.status);
  } else {
    defaultRet.status = <i>{t('labelNotTargeted')}</i>;
    return defaultRet;
  }
  defaultRet.statusIcon = getRecordStatusIcon(pr.status);
  if (pr.status === RecordStatus.ACTIVE) {
    if (pr.record_type === RecordType.CONSENT) {
      return { ...defaultRet, status: t('labelRequestAccepted') };
    }
    return defaultRet;
  }
  if (pr.status === RecordStatus.EXPIRED) {
    return { ...defaultRet, date: formatDate(pr.expires, false) };
  }

  let latestNotificationForAnyParticipant = null;
  let anyLatestEmailFailed = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const prp of participants) {
    const latestNotification = getLatestParticipantNotification(prp, metadatas);
    if (![null, 200].includes(latestNotification.status)) {
      anyLatestEmailFailed = true;
      break;
    }
    if (
      latestNotification.date !== null &&
      (latestNotificationForAnyParticipant === null ||
        latestNotification.date > latestNotificationForAnyParticipant)
    ) {
      latestNotificationForAnyParticipant = latestNotification.date;
    }
  }
  if (anyLatestEmailFailed) {
    defaultRet.anyNotificationFailed = true;
  }
  if (anyLatestEmailFailed || latestNotificationForAnyParticipant === null) {
    if (pr.status === RecordStatus.PENDING)
      return {
        ...defaultRet,
        date: formatDate(pr.created, false),
        status: t('labelRequestSent'),
      };
    return defaultRet;
  }

  if (pr.status === RecordStatus.PENDING) {
    return {
      ...defaultRet,
      date: formatDate(latestNotificationForAnyParticipant, false),
      status: t('labelNotificationSent'),
    };
  }
  return defaultRet;
};

/* Styled Components */

const StyledStatusWrapper = styled.div`
  .de-emphasis {
    margin-left: 2em;
    margin-bottom: -0.325em;
  }
`;

const StyledWarningsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25em;
`;

const StyledDeEmphasis = styled.div.attrs({ className: 'de-emphasis' })`
  font-size: 0.875em;
  color: ${(props) => props.theme.grey700};
`;

const StyledColoredText = styled.div`
  color: ${(props) => props.$color};
`;
