// eslint-disable-next-line import/prefer-default-export
export const chunkify = (arr, chunkSize) =>
  arr.reduce((all, one, index) => {
    const chunkIndex = Math.floor(index / chunkSize);
    if (!all[chunkIndex]) {
      // eslint-disable-next-line no-param-reassign
      all[chunkIndex] = [];
    }
    all[chunkIndex].push(one);
    return all;
  }, []);
