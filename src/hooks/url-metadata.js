import { getUrlMetadata } from 'mydatashare-core';
import { useMemo } from 'react';

/**
 * Return a memoized version of url metadatas for given object.
 *
 * mydatashare-core's `getUrlMetadata()` returns a new object each time it is called.
 * To reduce unnecessary re-renders and to allow using url metadata objects as dependencies
 * in hooks like useEffect, the value of `getUrlMetadata()` is memoized here.
 *
 * @param data The returned data from an API call.
 * @param obj The object for which urls should be returned. See `getApiObject`.
 * @returns {*} Object with keys being UUIDs and values metadata objects.
 */
const useUrlMetadata = (data, obj) => {
  const meta = obj !== null && data && data.metadatas ? data.metadatas : null;
  return useMemo(
    () => (obj !== null && meta !== null ? getUrlMetadata(meta, obj) : {}),
    [meta, obj]
  );
};

export default useUrlMetadata;
