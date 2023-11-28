import { ValidationRule } from 'react-hook-form';

import { Estonia, Finland, Latvia, Lithuania, Sweden } from 'nin';

export const VALIDATE_EMAIL: { pattern: ValidationRule<RegExp> } = {
  pattern: {
    value:
      /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    message: 'errorValidationEmail',
  },
};

export const VALIDATE_SSN_FIN = {
  validate: (v: string) => Finland.validate(v) || 'errorValidationFinSsn',
};

export const VALIDATE_SSN_SWE = {
  validate: (v: string) => Sweden.validate(v) || 'errorValidationSweSsn',
};

export const VALIDATE_SSN_EST = {
  validate: (v: string) => Estonia.validate(v) || 'errorValidationEstSsn',
};

export const VALIDATE_SSN_LVA = {
  validate: (v: string) => Latvia.validate(v) || 'errorValidationLvaSsn',
};

export const VALIDATE_SSN_LTU = {
  validate: (v: string) => Lithuania.validate(v) || 'errorValidationLtuSsn',
};

export const VALIDATE_NON_WHITESPACE: { pattern: ValidationRule<RegExp> } = {
  pattern: {
    value: /\S/,
    message: 'errorValidationOnlyWhitespace',
  },
};

export const VALIDATE_REG_NUM_FIN: { pattern: ValidationRule<RegExp> } = {
  pattern: {
    value: /^\d{7}-\d$/,
    message: 'errorValidationFinRegNum',
  },
};

export const VALIDATE_REG_NUM_SWE: { pattern: ValidationRule<RegExp> } = {
  pattern: {
    value: /^\d{6}-\d{4}$/,
    message: 'errorValidationSweRegNum',
  },
};

export const VALIDATE_URL: { pattern: ValidationRule<RegExp> } = {
  pattern: {
    value:
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.?[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
    message: 'errorValidationUrl',
  },
};

export const VALIDATE_UUID: { pattern: ValidationRule<RegExp> } = {
  pattern: {
    value:
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    message: 'errorValidationUuid',
  },
};
