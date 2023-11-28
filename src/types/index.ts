import { ReactNode } from 'react';

import {
  Metadata,
  Organization,
  OrganizationIdentifier,
  ProcessingRecord,
  ProcessingRecordParticipant,
} from 'types/api-objects';
import { RecordStatus, RecordType } from 'types/enums';

export interface UserPartial {
  token: string;
  idToken: string;
  givenName: string;
  familyName: string;
  username: string;
  identifierUuid: string | null;
  metadatas?: Record<string, Metadata>;
  organization?: Organization;
  organizations?: Record<string, Organization>;
  organizationIdentifier?: OrganizationIdentifier;
  organizationIdentifiers: OrganizationIdentifier[];
}

export interface User extends UserPartial {
  metadatas: Record<string, Metadata>;
  organization: Organization;
  organizations: Record<string, Organization>;
  organizationIdentifier: OrganizationIdentifier;
}

export type SearchTerms = {
  data_consumer_uuid?: string;
  data_provider_uuid?: string;
  group_id?: string;
  status?: RecordStatus | RecordStatus[];
  record_type?: RecordType | RecordType[];
};

export interface IdTypeData {
  name: string;
  value: string;
  uuidValue: string;
  flag?: string;
  inputs?: ReactNode;
}

interface LocationState {
  path: string;
  search: string;
  hash: string;
}

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  key: string;
  state: LocationState | null;
}

interface PersonIdentifier {
  id: string;
  type: string;
  country?: string;
}

export interface Person {
  id: string;
  identifiers: PersonIdentifier[];
}

export interface ParticipantInfo {
  id: string;
  status?: string;
  email?: string;
  name?: string;
  hasNoIdentifiers?: boolean;
}

export interface PersonWithRecords {
  person: Person | null;
  records: ProcessingRecordWithParticipants[];
  participantInfos: ParticipantInfo[];
}

export interface ProcessingRecordWithParticipants extends ProcessingRecord {
  participants: ProcessingRecordParticipant[];
  notInTargetGroup?: boolean;
}

export type ProcessingRecordFilterStats = {
  [key in RecordStatus]: PersonWithRecords[];
} & {
  all: PersonWithRecords[];
  notTargeted: PersonWithRecords[];
  notInTargetGroup: PersonWithRecords[];
  targeted: PersonWithRecords[];
};

export type ProcessingRecordFilters = {
  [key in keyof ProcessingRecordFilterStats]: boolean;
};

export type QueryKey = [key: string, payload: object, offset: number];

export interface QueryKeyGet {
  queryKey: [_: string, payload: { uuid: string }];
}

export interface APISearchParams {
  queryKey: QueryKey;
  pageParam: number;
}
