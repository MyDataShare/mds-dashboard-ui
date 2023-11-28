// eslint-disable-next-line import/prefer-default-export
export const getPersonRowKey = ({ person, records }) =>
  records.length > 0 ? records[0].uuid : person.id;
