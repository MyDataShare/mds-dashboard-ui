import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Accordion from 'components/accordion';
import LabeledValue from 'components/labeled-value';
import CellRecordParticipants from 'components/record-table/cell-record-participants';
import CellRecordStatus from 'components/record-table/cell-record-status';
import CellRecordSubject from 'components/record-table/cell-record-subject';
import { PersonWithRecords } from 'types';
import { Metadata } from 'types/api-objects';

interface Props {
  heading: string;
  metadatas: Metadata[];
  personsAndRecords: PersonWithRecords[];
  collapsed?: boolean;
  info?: string;
}

const PersonAccordion = ({
  heading,
  metadatas,
  personsAndRecords,
  collapsed = true,
  info = undefined,
}: Props) => {
  const { t } = useTranslation();
  return (
    <StyledPersonAccordion
      showToggle
      toggleFirst
      collapsed={collapsed}
      titleComponent={
        <StyledPersonAccordionTitleWrapper>
          {heading}
        </StyledPersonAccordionTitleWrapper>
      }
    >
      {info && <StyledPersonAccordionInfo>{info}</StyledPersonAccordionInfo>}
      <StyledPersonAccordionWrapper>
        {personsAndRecords.map(({ person, records, participantInfos }) => {
          const key = records.length > 0 ? records[0].uuid : person?.id;
          return (
            <StyledPersonAccordionInnerWrapper key={key}>
              <LabeledValue
                label={t('labelSubject')}
                value={
                  <CellRecordSubject
                    person={person}
                    record={records.length > 0 ? records[0] : null}
                  />
                }
              />
              <div>
                {participantInfos && participantInfos.length > 0 && (
                  <LabeledValue
                    label={t('labelParticipants')}
                    value={
                      <CellRecordParticipants
                        participantInfos={participantInfos}
                      />
                    }
                  />
                )}
              </div>
              <CellRecordStatus
                record={records.length > 0 ? records[0] : null}
                participants={
                  records.length > 0 ? records[0].participants : null
                }
                metadatas={metadatas}
                compact
              />
            </StyledPersonAccordionInnerWrapper>
          );
        })}
      </StyledPersonAccordionWrapper>
    </StyledPersonAccordion>
  );
};

export default PersonAccordion;

/* Styled Components */

const StyledPersonAccordion = styled(Accordion)`
  margin-top: 1.75em;
`;

const StyledPersonAccordionTitleWrapper = styled.div`
  font-weight: ${(p) => p.theme.fontSemiBold};
`;

const StyledPersonAccordionInfo = styled.div`
  margin-top: 1em;
`;

const StyledPersonAccordionWrapper = styled.div`
  max-height: 20em;
  overflow-y: auto;
  width: 100%;
  padding: 0 1em;
  margin: 1em 0 1em 0;
  border-left: 3px solid ${(p) => p.theme.grey250};
`;

const StyledPersonAccordionInnerWrapper = styled.div`
  margin: 1.25em 0;
  display: grid;
  grid-template-columns: 30% 45% 25%;
  max-width: 100%;
  > * {
    flex-basis: 50%;
  }
`;
