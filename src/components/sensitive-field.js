import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import Button from 'components/button';

// TODO: a11y
// TODO: Can cut off in table
const SensitiveField = ({ children }) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <StyledWrapper>
      <StyledButton
        className="btn-toggle-sensitive"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          return setVisible(!visible);
        }}
        variant="text"
        icon={
          visible ? (
            <FontAwesomeIcon icon={icon({ name: 'eye' })} />
          ) : (
            <FontAwesomeIcon icon={icon({ name: 'eye-slash' })} />
          )
        }
        text=""
      />
      <StyledHiddenPlaceholder className="hidden-placeholder" visible={visible}>
        <StyledValueWrapper visible={visible} aria-hidden={!visible}>
          {visible && children}
        </StyledValueWrapper>
      </StyledHiddenPlaceholder>
    </StyledWrapper>
  );
};

SensitiveField.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SensitiveField;

/* Styled Components */

const StyledWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin: -0.5em;
  > * {
    margin: 0.5em;
  }
  > *:first-child {
    margin-right: -0.5em;
  }
`;

const StyledButton = styled(Button)`
  margin-right: 0.75em;
  width: fit-content !important;
`;

const StyledValueWrapper = styled.div`
  visibility: ${(props) => (props.visible ? 'inherit' : 'hidden')};
`;

const StyledHiddenPlaceholder = styled.div`
  &&:before {
    font-weight: ${(props) => props.theme.fontMedium};
    content: ${(props) =>
      props.visible ? '' : '"\\2217\\2217\\2217\\2217\\2217"'};
  }
`;
