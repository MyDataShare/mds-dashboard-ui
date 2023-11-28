import { getTranslationMetadata } from 'mydatashare-core';
import { useMemo } from 'react';

/**
 * Return a memoized version of translation metadatas for given object.
 *
 * mydatashare-core's `getTranslationMetadata()` returns a new object each time it is called.
 * To reduce unnecessary re-renders and to allow using translation metadata objects as dependencies
 * in hooks like useEffect, the value of `getTranslationMetadata()` is memoized here.
 *
 * @param data The returned data from an API call.
 * @param obj The object for which translations should be returned. See `getApiObject`.
 * @returns {*} Object with keys being UUIDs and values metadata objects.
 */
const useTranslationMetadata = (data, obj) => {
  const meta = obj !== null && data && data.metadatas ? data.metadatas : null;
  return useMemo(
    () =>
      obj !== null && meta !== null ? getTranslationMetadata(meta, obj) : {},
    [meta, obj]
  );
};

export default useTranslationMetadata;
