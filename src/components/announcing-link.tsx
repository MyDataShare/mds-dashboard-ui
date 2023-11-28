import { MouseEventHandler, ReactNode } from 'react';
import { Link, LinkProps, NavLink } from 'react-router-dom';

import { TITLE_ANNOUNCER_ELEM_ID } from 'util/constants';

interface Props extends LinkProps {
  children: ReactNode;
  onClick?: MouseEventHandler;
  type?: 'Link' | 'NavLink';
}

const AnnouncingLink = ({
  children,
  onClick = undefined,
  type = 'Link',
  ...props
}: Props) => {
  let LinkComponent: React.ElementType;
  switch (type) {
    case 'NavLink':
      LinkComponent = NavLink;
      break;
    case 'Link':
    default:
      LinkComponent = Link;
  }
  return (
    <LinkComponent
      {...props}
      onClick={(event: React.MouseEvent<Element, MouseEvent>) =>
        activateTitleAnnouncer(event, onClick)
      }
    >
      {children}
    </LinkComponent>
  );
};

/* Helpers */

const activateTitleAnnouncer = (
  event: React.MouseEvent<Element, MouseEvent>,
  onClick?: MouseEventHandler
) => {
  // When clicked, activate the TitleAnnouncer.
  try {
    const titleAnnouncer = document.getElementById(TITLE_ANNOUNCER_ELEM_ID);
    if (titleAnnouncer) {
      titleAnnouncer.setAttribute('aria-live', 'assertive');
    }
  } finally {
    if (onClick) {
      onClick(event);
    }
  }
};

export default AnnouncingLink;
