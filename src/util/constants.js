import { getEnvVar } from 'util/env';

export const CLIENT_ID = getEnvVar('REACT_APP_CLIENT_ID');
export const SCOPE = 'openid profile organization dashboard';
export const REDIRECT_URI = `${window.location.origin}/login`;
export const POST_LOGOUT_REDIRECT_URI = `${window.location.origin}/logout`;
export const AUTH_ITEM_NAMES = getEnvVar('REACT_APP_AUTH_ITEM_NAMES').split(
  ';'
);
export const WALLET_URL = getEnvVar('REACT_APP_WALLET_URL');
export const MDS_API_URL = getEnvVar('REACT_APP_MDS_API_URL');

// TODO: MDP2-1537 MDS API fetches, result validations, constants etc should be moved to MDS Core JS

const STABLE_API_VER = 'v3.0';
const LATEST_API_VER = 'v3.1';

export const ENDPOINT_ACCESS_GATEWAY = `organization/${STABLE_API_VER}/access_gateway`;
export const ENDPOINT_ACCESS_GATEWAYS = `organization/${STABLE_API_VER}/access_gateways`;
export const ENDPOINT_DATA_CONSUMER = `organization/${STABLE_API_VER}/data_consumer`;
export const ENDPOINT_DATA_CONSUMERS = `organization/${STABLE_API_VER}/data_consumers`;
export const ENDPOINT_DATA_PROVIDER = `organization/${STABLE_API_VER}/data_provider`;
export const ENDPOINT_DATA_PROVIDERS = `organization/${STABLE_API_VER}/data_providers`;
export const ENDPOINT_EXT_APIS = `organization/${STABLE_API_VER}/ext_apis`;
export const ENDPOINT_EXTERNAL_API = `dashboard/${STABLE_API_VER}/ext`;
export const ENDPOINT_METADATA = `organization/${STABLE_API_VER}/metadata`;
export const ENDPOINT_ORGANIZATION_IDS = `organization/${STABLE_API_VER}/organization_ids`;
export const ENDPOINT_ORGANIZATION_IDENTIFIER = `organization/${STABLE_API_VER}/organization_identifier`;
export const ENDPOINT_ORGANIZATION_IDENTIFIERS = `organization/${STABLE_API_VER}/organization_identifiers`;
export const ENDPOINT_IDENTIFIERS = `dashboard/${STABLE_API_VER}/identifiers`;
export const ENDPOINT_SEND_EMAIL = `organization/${STABLE_API_VER}/send_email_notification`;
export const ENDPOINT_SUPPORT_REQUEST = `organization/${STABLE_API_VER}/support_request`;

export const ENDPOINT_PROCESSING_RECORD = `organization/${LATEST_API_VER}/processing_record`;
export const ENDPOINT_PROCESSING_RECORDS = `organization/${LATEST_API_VER}/processing_records`;
export const ENDPOINT_PROCESSING_RECORD_PARTICIPANT = `organization/${LATEST_API_VER}/processing_record_participant`;

export const TITLE_ANNOUNCER_ELEM_ID = 'title_announcer';
export const HEADER_MENU_BREAKPOINT = 784;
export const HEADER_MENU_BREAKPOINT_PX = `${HEADER_MENU_BREAKPOINT}px`;
export const SEARCH_LIMIT = 20;
export const SEARCH_OFFSET_MAX = 9223372036854775800;

export const QUERY_ERR_MSG_KEY = 'errorQuery';
