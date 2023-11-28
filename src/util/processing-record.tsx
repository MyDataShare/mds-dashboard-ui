import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';

import theme, { Color } from 'theme';
import {
  ProcessingRecord,
  ProcessingRecordParticipant,
} from 'types/api-objects';
import { RecordStatus, RecordType } from 'types/enums';
import { capitalize } from 'util/string';

export const NOT_TARGETED = 'notTargeted';
export const NOT_IN_TARGET_GROUP = 'notInTargetGroup';

export const STATUS_SORT_ORDER = [
  RecordStatus.PENDING,
  RecordStatus.ACTIVE,
  RecordStatus.DECLINED,
  RecordStatus.SUSPENDED,
  RecordStatus.EXPIRED,
  RecordStatus.WITHDRAWN,
  NOT_TARGETED,
  NOT_IN_TARGET_GROUP,
];

export const NON_TERMINAL_STATUSES = [
  RecordStatus.PENDING,
  RecordStatus.ACTIVE,
  RecordStatus.DECLINED,
  RecordStatus.SUSPENDED,
];

export const getParticipantIcon = (
  processingRecordParticipant: ProcessingRecordParticipant,
  props?: Partial<FontAwesomeIconProps>
) => {
  if (processingRecordParticipant === null) return null;
  const PARTICIPANT_ICONS = {
    data_subject: (
      <FontAwesomeIcon icon={icon({ name: 'user-tag' })} {...props} />
    ),
    activator: (
      <FontAwesomeIcon icon={icon({ name: 'user-check' })} {...props} />
    ),
    generic: <FontAwesomeIcon icon={icon({ name: 'user' })} {...props} />,
  };
  if (!(processingRecordParticipant.role in PARTICIPANT_ICONS))
    return PARTICIPANT_ICONS.generic;
  return PARTICIPANT_ICONS[processingRecordParticipant.role];
};

export const getRecordStatusColor = (
  record: ProcessingRecord | null = null
) => {
  if (record === null) return null;
  return theme[`status${capitalize(record.status)}` as Color];
};

export const getRecordStatusSortKey = (
  a: RecordStatus | string,
  b: RecordStatus | string
) => STATUS_SORT_ORDER.indexOf(a) - STATUS_SORT_ORDER.indexOf(b);

export const getRecordStatusIcon = (
  status: RecordStatus | 'not_applicable' | 'notTargeted' | 'notInTargetGroup',
  props?: Partial<FontAwesomeIconProps>
) => {
  const RECORD_STATUS_ICONS = {
    active: (
      <FontAwesomeIcon icon={icon({ name: 'circle-check' })} {...props} />
    ),
    declined: <FontAwesomeIcon icon={icon({ name: 'ban' })} {...props} />,
    deleted: <FontAwesomeIcon icon={icon({ name: 'trash' })} {...props} />,
    expired: (
      <FontAwesomeIcon icon={icon({ name: 'calendar-xmark' })} {...props} />
    ),
    pending: <FontAwesomeIcon icon={icon({ name: 'hourglass' })} {...props} />,
    suspended: (
      <FontAwesomeIcon icon={icon({ name: 'circle-exclamation' })} {...props} />
    ),
    withdrawn: (
      <FontAwesomeIcon icon={icon({ name: 'box-archive' })} {...props} />
    ),
    not_applicable: (
      <FontAwesomeIcon icon={icon({ name: 'minus' })} {...props} />
    ),
    notTargeted: <FontAwesomeIcon icon={icon({ name: 'minus' })} {...props} />,
    notInTargetGroup: (
      <FontAwesomeIcon icon={icon({ name: 'minus' })} {...props} />
    ),
  };
  if (!(status in RECORD_STATUS_ICONS)) return RECORD_STATUS_ICONS.suspended;
  return RECORD_STATUS_ICONS[status];
};

export const getRecordTypeIcon = (
  type: RecordType,
  props?: Partial<FontAwesomeIconProps>
) => {
  const RECORD_TYPE_ICONS = {
    consent: <FontAwesomeIcon icon={icon({ name: 'handshake' })} {...props} />,
    contract: (
      <FontAwesomeIcon icon={icon({ name: 'file-signature' })} {...props} />
    ),
    legal_obligation: (
      <FontAwesomeIcon icon={icon({ name: 'scale-balanced' })} {...props} />
    ),
    legitimate_interest: (
      <FontAwesomeIcon icon={icon({ name: 'building' })} {...props} />
    ),
    mds_contract_tos: (
      <FontAwesomeIcon icon={icon({ name: 'file-signature' })} {...props} />
    ),
    service_tos: (
      <FontAwesomeIcon icon={icon({ name: 'file-signature' })} {...props} />
    ),
  };
  if (!(type in RECORD_TYPE_ICONS)) return RECORD_TYPE_ICONS.consent;
  return RECORD_TYPE_ICONS[type];
};
