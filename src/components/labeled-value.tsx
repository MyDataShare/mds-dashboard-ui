import PropTypes from 'prop-types';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Markdown from 'components/markdown';
import SensitiveField from 'components/sensitive-field';
import { Theme } from 'theme';
import { stringToAlpha } from 'util/string';

interface Props {
  label: string;
  value: ReactNode;
  idPostfix?: string;
  markdown?: boolean;
  sensitive?: boolean;
}

const LabeledValue = ({
  label,
  value,
  idPostfix = undefined,
  markdown = false,
  sensitive = false,
}: Props) => {
  const { t } = useTranslation();
  let displayedValue = value;
  let deEmphasisValue = false;
  if (value === undefined || value === null) {
    displayedValue = t('labelNoValue');
    deEmphasisValue = true;
  } else if (typeof value === 'string' && value.length === 0) {
    displayedValue = t('labelEmptyString');
    deEmphasisValue = true;
  } else if (typeof value === 'boolean') {
    displayedValue = value.toString();
  }
  let valueId = `labeled-value-${stringToAlpha(label)}`;
  if (idPostfix) {
    valueId = `${valueId}-${idPostfix}`;
  }
  const Value =
    markdown && typeof displayedValue === 'string' ? (
      <StyledMarkdownValue id={valueId} $deEmphasis={deEmphasisValue}>
        <Markdown>{displayedValue}</Markdown>
      </StyledMarkdownValue>
    ) : (
      <StyledValue id={valueId} $deEmphasis={deEmphasisValue}>
        {displayedValue}
      </StyledValue>
    );
  return (
    <StyledWrapper className="labeledValue">
      <StyledLabel>{label}</StyledLabel>
      {sensitive ? <SensitiveField>{Value}</SensitiveField> : Value}
    </StyledWrapper>
  );
};

export default LabeledValue;

LabeledValue.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
  sensitive: PropTypes.bool,
  markdown: PropTypes.bool,
  idPostfix: PropTypes.string,
};

LabeledValue.defaultProps = {
  value: null,
  sensitive: false,
  markdown: false,
  idPostfix: null,
};

/* Styled Components */

const StyledWrapper = styled.div`
  margin: 1em 0 0.75em 0;
  p:first-of-type {
    margin-top: 0.25em;
  }
`;

const StyledLabel = styled.div`
  color: ${(props) => props.theme.grey700};
  font-size: ${(props) => props.theme.fontSizeSmaller};
  font-weight: ${(props) => props.theme.fontSemiBold};
`;

interface ValueStylesProps {
  $deEmphasis: boolean;
  theme: Theme;
}

const valueStyles = (props: ValueStylesProps) => `
  color: ${props.$deEmphasis ? props.theme.grey700 : 'inherit'};
  font-style: ${props.$deEmphasis ? 'italic' : 'normal'};
  > ul:first-child {
    margin-top: 0.25em;
  }
`;

const StyledValue = styled.div<ValueStylesProps>`
  ${(props) => valueStyles(props)};
  margin: 0.25em 0 0 0;
`;

const StyledMarkdownValue = styled.div<ValueStylesProps>`
  ${(props) => valueStyles(props)};
  *:first-child {
    margin-top: 0;
  }
`;
