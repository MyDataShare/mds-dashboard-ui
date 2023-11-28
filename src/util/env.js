// eslint-disable-next-line import/prefer-default-export
export const getEnvVar = (key) => {
  // eslint-disable-next-line no-underscore-dangle
  if (window._env_[key]) return window._env_[key];
  return process.env[key];
};
