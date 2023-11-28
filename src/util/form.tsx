import { TFunction } from 'i18next';

import Input from 'components/input';
import { IdTypeData } from 'types';
import {
  VALIDATE_NON_WHITESPACE,
  VALIDATE_SSN_EST,
  VALIDATE_SSN_FIN,
  VALIDATE_SSN_LTU,
  VALIDATE_SSN_LVA,
  VALIDATE_SSN_SWE,
} from 'util/validation';

/**
 * Flatten an object.
 *
 * **Examples**
 *
 * ```
 * {foo: {bar: 'bar', baz: 'baz'}}
 * --> {'foo.bar': 'bar', 'foo.baz': 'baz'}
 *
 * {foo: {bar: ['bar', 'baz']}}
 * --> {'foo.bar': ['bar', 'baz']}
 * ```
 */
export const flatten = (obj: object) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any
  const ret: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (!(key in ret)) {
        ret[key] = [];
      }
      if (!Array.isArray(ret[key])) {
        throw new Error(
          `Tried to flatten array ${key}, but it is not an array: ${ret[key]}`
        );
      }
      ret[key] = ret[key].concat(value);
    } else if (typeof value === 'object' && value !== null) {
      const flatObj = flatten(value);
      Object.entries(flatObj).forEach(([flatKey, flatValue]) => {
        const retKey = `${key}.${flatKey}`;
        ret[retKey] = flatValue;
      });
    } else {
      ret[key] = value;
    }
  });
  return ret;
};

export const sortIdTypeData = (t: TFunction, a: IdTypeData, b: IdTypeData) =>
  t(a.name) > t(b.name) ? 1 : -1;

export const getSortedIdTypeData = (t: TFunction, namePrefix: string) =>
  Object.values(getIdTypeData(t, namePrefix)).sort((a, b) =>
    sortIdTypeData(t, a, b)
  );

export const getIdTypeData = (
  t: TFunction,
  namePrefix: string
): Record<IdTypeData['value'], IdTypeData> => ({
  ssn__fin: {
    name: 'labelSsnFin',
    value: 'ssn__fin',
    uuidValue: '49679532-9c4c-4a46-9e5b-a914472f9612',
    flag: 'fi',
    inputs: (
      <>
        <Input
          hidden
          type="hidden"
          name={`${namePrefix}.identifier.country`}
          id={`${namePrefix}.identifier.country`}
          value="FIN"
        />
        <Input
          name={`${namePrefix}.identifier.id`}
          id={`${namePrefix}.identifier.id`}
          label={t('labelSsnFin')}
          options={VALIDATE_SSN_FIN}
          required
        />
      </>
    ),
  },
  ssn__swe: {
    name: 'labelSsnSwe',
    value: 'ssn__swe',
    uuidValue: 'f92d51d9-5ee9-4554-bb33-ad0560691399',
    flag: 'se',
    inputs: (
      <>
        <Input
          hidden
          type="hidden"
          name={`${namePrefix}.identifier.country`}
          id={`${namePrefix}.identifier.country`}
          value="SWE"
        />
        <Input
          name={`${namePrefix}.identifier.id`}
          id={`${namePrefix}.identifier.id`}
          label={t('labelSsnSwe')}
          options={VALIDATE_SSN_SWE}
          required
        />
      </>
    ),
  },
  ssn__est: {
    name: 'labelSsnEst',
    value: 'ssn__est',
    uuidValue: '90435a44-7c6e-4361-8f73-edaac705b2d0',
    flag: 'ee',
    inputs: (
      <>
        <Input
          hidden
          type="hidden"
          name={`${namePrefix}.identifier.country`}
          id={`${namePrefix}.identifier.country`}
          value="EST"
        />
        <Input
          name={`${namePrefix}.identifier.id`}
          id={`${namePrefix}.identifier.id`}
          label={t('labelSsnEst')}
          options={VALIDATE_SSN_EST}
          required
        />
      </>
    ),
  },
  ssn__lva: {
    name: 'labelSsnLva',
    value: 'ssn__lva',
    uuidValue: '1d6ea84f-e489-4ade-8c04-ce3f6dadf0b8',
    flag: 'lv',
    inputs: (
      <>
        <Input
          hidden
          type="hidden"
          name={`${namePrefix}.identifier.country`}
          id={`${namePrefix}.identifier.country`}
          value="LVA"
        />
        <Input
          name={`${namePrefix}.identifier.id`}
          id={`${namePrefix}.identifier.id`}
          label={t('labelSsnLva')}
          options={VALIDATE_SSN_LVA}
          required
        />
      </>
    ),
  },
  ssn__ltu: {
    name: 'labelSsnLtu',
    value: 'ssn__ltu',
    uuidValue: 'd9b84337-a23b-4ba0-aec5-044a5e5909e9',
    flag: 'lt',
    inputs: (
      <>
        <Input
          hidden
          type="hidden"
          name={`${namePrefix}.identifier.country`}
          id={`${namePrefix}.identifier.country`}
          value="LTU"
        />
        <Input
          name={`${namePrefix}.identifier.id`}
          id={`${namePrefix}.identifier.id`}
          label={t('labelSsnLtu')}
          options={VALIDATE_SSN_LTU}
          required
        />
      </>
    ),
  },
  email: {
    name: 'labelEmail',
    value: 'email',
    uuidValue: '07eb2964-19e4-448a-80e9-95949db0f620',
    inputs: (
      <Input
        name={`${namePrefix}.identifier.id`}
        id={`${namePrefix}.identifier.id`}
        label={t('labelEmail')}
        type="email"
        required
      />
    ),
  },
  phone_number: {
    name: 'labelPhoneNumber',
    value: 'phone_number',
    uuidValue: 'd8bd7a7e-7380-4367-966d-7b040978eddd',
    inputs: (
      <Input
        name={`${namePrefix}.identifier.id`}
        id={`${namePrefix}.identifier.id`}
        label={t('labelPhoneNumber')}
        options={VALIDATE_NON_WHITESPACE}
        required
      />
    ),
  },
  helsinki_tunnistus_uid: {
    name: 'labelHelsinkiTunnistusUid',
    value: 'helsinki_tunnistus_uid',
    uuidValue: '1a586182-ce10-4277-a194-38f67b2e22a6',
    inputs: (
      <Input
        name={`${namePrefix}.identifier.id`}
        id={`${namePrefix}.identifier.id`}
        label={t('labelHelsinkiTunnistusUid')}
        options={VALIDATE_NON_WHITESPACE}
        required
      />
    ),
  },
  sisuid_uid: {
    name: 'labelSisuIdUid',
    value: 'sisuid_uid',
    uuidValue: '6d2a3e9c-52b5-4675-ac61-7db1d47fc582',
  },
  qvarn_person_id: {
    name: 'labelQvarnPersonId',
    value: 'qvarn_person_id',
    uuidValue: '984ac592-ed8d-419a-bd84-844714762f2a',
    inputs: (
      <Input
        name={`${namePrefix}.identifier.id`}
        id={`${namePrefix}.identifier.id`}
        label={t('labelQvarnPersonId')}
        options={VALIDATE_NON_WHITESPACE}
        required
      />
    ),
  },
  qvarn_employee_id: {
    name: 'labelQvarnEmployeeId',
    value: 'qvarn_employee_id',
    uuidValue: 'd2bbef80-973a-49d1-9fec-46184a7220d9',
    inputs: (
      <Input
        name={`${namePrefix}.identifier.id`}
        id={`${namePrefix}.identifier.id`}
        label={t('labelQvarnEmployeeId')}
        options={VALIDATE_NON_WHITESPACE}
        required
      />
    ),
  },
  qvarn_card_id: {
    name: 'labelQvarnCardId',
    value: 'qvarn_card_id',
    uuidValue: '7b1b7464-46c4-4f9b-8f55-cf05a2d0def7',
    inputs: (
      <Input
        name={`${namePrefix}.identifier.id`}
        id={`${namePrefix}.identifier.id`}
        label={t('labelQvarnCardId')}
        options={VALIDATE_NON_WHITESPACE}
        required
      />
    ),
  },
  qvarn_contract_id: {
    name: 'labelQvarnContractId',
    value: 'qvarn_contract_id',
    uuidValue: 'babd992a-a4f0-4275-812b-6128771f4187',
    inputs: (
      <Input
        name={`${namePrefix}.identifier.id`}
        id={`${namePrefix}.identifier.id`}
        label={t('labelQvarnContractId')}
        options={VALIDATE_NON_WHITESPACE}
        required
      />
    ),
  },
  kasko_id: {
    name: 'labelKaskoId',
    value: 'kasko_id',
    uuidValue: '5488385e-fcaa-4a9b-a59c-a62f4f1af625',
    inputs: (
      <Input
        name={`${namePrefix}.identifier.id`}
        id={`${namePrefix}.identifier.id`}
        label={t('labelKaskoId')}
        options={VALIDATE_NON_WHITESPACE}
        required
      />
    ),
  },
});

export const removeEmptyFields = (data: Record<string, unknown>) => {
  Object.keys(data).forEach((key) => {
    if (data[key] === '' || data[key] == null) {
      // eslint-disable-next-line no-param-reassign
      delete data[key];
    }
  });
};
