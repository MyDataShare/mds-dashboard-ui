import React from 'react';

export const BreadcrumbsContext = React.createContext([]);

export const useBreadcrumbs = () => React.useContext(BreadcrumbsContext);
