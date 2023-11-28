import PropTypes from 'prop-types';
import React from 'react';

import Error from 'components/error';

/**
 * Error boundary for catching errors during the render phase.
 *
 * Displays an error page with the error message.
 *
 * If the prop `logOutUser` with value `true` is given, the user is logged out
 * after catching the error.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.logOutUser = !!props.logOutUser;
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { errorInfo, error } = this.state;
    const { children } = this.props;
    if (errorInfo) {
      return <Error message={error.message} logOutUser={this.logOutUser} />;
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  logOutUser: PropTypes.bool,
};

ErrorBoundary.defaultProps = {
  children: null,
  logOutUser: false,
};

export default ErrorBoundary;
