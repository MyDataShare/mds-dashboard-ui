import styled from 'styled-components';

import { TITLE_ANNOUNCER_ELEM_ID } from 'util/constants';

// Note: aria-live is 'off' here, to prevent the screen reader from reading "Navigated to x"
// when the page is first loaded. AnnouncingLink elements will set this to aria-live='assertive'
// when they are clicked. This activates the TitleAnnouncer only when some client side
// navigation has occurred.
// Note #2: See Helpers.setTitle for how this element's text content is updated.
const TitleAnnouncer = () => (
  <StyledAnnouncer
    aria-live="off"
    aria-atomic="true"
    id={TITLE_ANNOUNCER_ELEM_ID}
  />
);

export default TitleAnnouncer;

/* Styled Components */

const StyledAnnouncer = styled.div`
  ${(props) => props.theme.screenReaderOnly}
`;
