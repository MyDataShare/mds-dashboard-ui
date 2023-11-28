import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import i18n from 'i18next';
import { getTranslation, LANGUAGES } from 'mydatashare-core';
import React from 'react';
import styled from 'styled-components';

import {
  fetchAccessGateway,
  fetchDataConsumer,
  fetchDataProvider,
  fetchProcessingRecord,
} from 'api/get';
import AnnouncingLink from 'components/announcing-link';
import { useBreadcrumbs } from 'context/breadcrumbs';
import { ParticipantRole } from 'types/enums';
import { getApiObject } from 'util/mds-api';
import { camelToSnake } from 'util/string';

// TODO: Use react-aria useBreadcrumbs?

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const pathPartToModelName = {
  members: 'processingRecord',
};

const queries = {
  accessGateway: fetchAccessGateway,
  dataConsumer: fetchDataConsumer,
  dataProvider: fetchDataProvider,
  processingRecord: fetchProcessingRecord,
  member: fetchProcessingRecord,
};

const DynamicBreadcrumb = ({ modelName, uuid, fallback }) => {
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [modelName, { uuid }],
    queryFn: queries[modelName],
  });
  if (isLoading) return fallback;
  if (!isSuccess) return fallback;

  const obj = getApiObject(data[`${camelToSnake(modelName)}s`]);
  if (obj !== null && typeof obj === 'object') {
    const dynamicName = resolveName(modelName, obj, data);
    if (dynamicName) return dynamicName;
  }
  return fallback;
};

const Breadcrumbs = () => {
  const values = useBreadcrumbs();
  return (
    <StyledWrapper id="breadcrumbs" className="breadcrumbs">
      {values.map(({ name, path }, index) => {
        const parts = path.split('/');
        let builtName = name;
        if (parts.length >= 3) {
          const uuid = parts[parts.length - 1];
          // Ensure tha last part is a UUID and the second to last a known modelName
          if (uuid.match(uuidRegex)) {
            let modelName = parts[parts.length - 2];
            if (modelName in pathPartToModelName) {
              modelName = pathPartToModelName[modelName];
            }
            if (modelName.endsWith('s')) modelName = modelName.slice(0, -1);
            if (modelName in queries) {
              builtName = (
                <DynamicBreadcrumb
                  modelName={modelName}
                  uuid={uuid}
                  fallback={name}
                />
              );
            }
          }
        }
        return (
          <React.Fragment key={path}>
            {index < values.length - 1 ? (
              <>
                <AnnouncingLink id={`breadcrumb-link-${index}`} to={path}>
                  {builtName}
                </AnnouncingLink>
                <FontAwesomeIcon
                  icon={icon({ name: 'chevron-right' })}
                  font-size="0.75em"
                />
              </>
            ) : (
              <div id="breadcrumb-current">{builtName}</div>
            )}
          </React.Fragment>
        );
      })}
    </StyledWrapper>
  );
};

export default Breadcrumbs;

/* Helpers */

const nameFields = {
  accessGateway: ['name'],
  dataConsumer: ['name'],
  dataProvider: ['name'],
};

const resolveName = (modelName, obj, data) => {
  let dynamicName = null;
  if (modelName in nameFields) {
    nameFields[modelName].forEach((nameField) => {
      if (data.metadatas) {
        dynamicName = getTranslation(
          obj,
          nameField,
          LANGUAGES[i18n.language],
          data.metadatas
        );
      } else {
        dynamicName = obj[nameField];
      }
    });
    if (dynamicName) dynamicName = dynamicName.trim();
    if (dynamicName) return dynamicName;
  }

  // When viewing a single ProcessingRecord, try to show the data subject's name in the breadcrumb.
  if (
    !dynamicName &&
    modelName === 'processingRecord' &&
    data.processing_record_participants
  ) {
    const participantUuids = obj['processing_record_participants.uuid'];
    const dataSubject = Object.values(data.processing_record_participants).find(
      (prp) =>
        prp.role === ParticipantRole.DATA_SUBJECT &&
        participantUuids.includes(prp.uuid)
    );
    if (
      dataSubject &&
      ![null, ''].includes(dataSubject.identifier_display_name)
    ) {
      return dataSubject.identifier_display_name;
    }
    return null;
  }
  return null;
};

/* Styled Components */

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 2em -0.5em 1em -0.5em;
  max-width: 80em;
  a,
  div {
    margin: 0 0.5em;
  }
  div {
    margin-right: 0;
    font-weight: ${(props) => props.theme.fontMedium};
  }
  a {
    text-decoration: underline;
  }
`;
