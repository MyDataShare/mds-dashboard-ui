import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import IconText from 'components/icon-text';
import { formatDate } from 'util/date';

const NotificationInfo = ({ email, notificationDate, isNotificationError }) => {
  const { t } = useTranslation();
  const NotificationIcon = isNotificationError ? (
    <FontAwesomeIcon icon={icon({ name: 'triangle-exclamation' })} />
  ) : (
    <FontAwesomeIcon icon={icon({ name: 'circle-info' })} />
  );
  if (!notificationDate) {
    return null;
  }
  return (
    <StyledNotificationInfoLabelWrapper $isError={isNotificationError}>
      <IconText
        text={
          isNotificationError ? (
            <div>
              {t('textLastNotificationSentToFailed', {
                email,
                date: formatDate(notificationDate),
              })}
            </div>
          ) : (
            <div>
              {t('textLastNotificationSentTo', {
                email,
                date: formatDate(notificationDate),
              })}
            </div>
          )
        }
        icon={NotificationIcon}
      />
    </StyledNotificationInfoLabelWrapper>
  );
};

NotificationInfo.propTypes = {
  email: PropTypes.string.isRequired,
  notificationDate: PropTypes.string,
  isNotificationError: PropTypes.bool.isRequired,
};

NotificationInfo.defaultProps = {
  notificationDate: null,
};

export default NotificationInfo;

/* Styled Components */

const StyledNotificationInfoLabelWrapper = styled.div`
  margin: -0.75em 0 0.75em 0;
  font-size: 0.8em;
  color: ${(props) =>
    props.$isError ? props.theme.errorColor : props.theme.grey700};
`;
