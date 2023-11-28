import PropTypes from 'prop-types';
import React from 'react';

const SelectOption = ({ children, value }) => (
  <option value={value}>{children}</option>
);

SelectOption.propTypes = {
  children: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default SelectOption;
