import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Dropdown from 'components/dropdown';

const DropdownRecordActions = ({
  // eslint-disable-next-line no-unused-vars
  record,
  onOpen,
}) => {
  /* TODO: Implement "send notification" button. Needs these to be intuitive:
      - Toast notifications (see permission UI for Notification component)
      - Access to API response headers of sendEmail request to get the
        request_id and find corresponding entry
        from notification_history, to be able to tell the user whether the email
        was successfully sent or not
   */
  const { t } = useTranslation();
  // const {
  //   mutate, isLoading, isError,
  // } = useMutation(() => sendEmail(record.uuid), {
  //   onSuccess: (data) => {
  //     alert('notified!');
  //     console.log({ data });
  //   },
  // });
  return (
    <StyledDropdownWrapper>
      <Dropdown
        icon={<FontAwesomeIcon icon={icon({ name: 'ellipsis-vertical' })} />}
        id={`actions-${record.uuid}`}
        useTextButton
      >
        <Dropdown.Item
          text={t('labelOpen')}
          onClick={() => onOpen(record.uuid)}
        />
        <Dropdown.Item
          text={t('labelCopyUuid')}
          onClick={() => navigator.clipboard.writeText(record.uuid)}
        />
        {/* {isNotifiable ? ( */}
        {/*  <> */}
        {/*    <hr /> */}
        {/*    <Dropdown.Item */}
        {/*      text={t('labelSendEmail')} */}
        {/*      onClick={mutate} */}
        {/*    /> */}
        {/*  </> */}
        {/* ) : <></>} */}
      </Dropdown>
    </StyledDropdownWrapper>
  );
};

DropdownRecordActions.propTypes = {
  record: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default DropdownRecordActions;

/* Styled Components */

const StyledDropdownWrapper = styled.div`
  // Override the default "text" button variant's color
  button {
    color: #000000 !important;
  }
`;
