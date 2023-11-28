import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

/**
 * A list of allowed ReactMarkdown node types for Markdown components.
 *
 * See ReactMarkdown.types for a list of all supported types.
 */
const ALLOWED_MD_TYPES: string[] = [
  'em',
  'strong',
  'li',
  'ul',
  'ol',
  'p',
  'a',
  'br',
  'pre',
  'span',
];

interface Props {
  children: string;
}

/**
 * A pre-configured markdown component with allowed types and other settings.
 */
const Markdown = ({ children }: Props) => (
  <StyledInlineWrapper>
    <ReactMarkdown
      allowedElements={ALLOWED_MD_TYPES}
      unwrapDisallowed
      linkTarget="_blank"
    >
      {children}
    </ReactMarkdown>
  </StyledInlineWrapper>
);

export default Markdown;

/* Styled Components */

const StyledInlineWrapper = styled.div`
  display: inline-block;
  *:last-child {
    margin-bottom: 0;
  }
`;
