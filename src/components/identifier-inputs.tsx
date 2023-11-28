import PropTypes from 'prop-types';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Select from 'components/select';
import { useUnregisterOnChange } from 'hooks';
import { getSortedIdTypeData } from 'util/form';

interface Props {
  namePrefix: string;
}

const IdentifierInputs = ({ namePrefix }: Props) => {
  const { t } = useTranslation();
  const selectedIdType = useWatch({
    name: `${namePrefix}.identifier.type`,
    defaultValue: 'ssn__fin',
  });

  useUnregisterOnChange(selectedIdType, `${namePrefix}.identifier.id`);

  const idTypeData = getSortedIdTypeData(t, namePrefix).filter(
    (idt) => !!idt.inputs
  );
  return (
    <>
      <Select
        label={t('labelIdType')}
        name={`${namePrefix}.identifier.type`}
        id={`${namePrefix}.identifier.type`}
        defaultValue={selectedIdType}
        required
      >
        {idTypeData.map((data) => (
          <Select.Option key={data.value} value={data.value}>
            {t(data.name)}
          </Select.Option>
        ))}
      </Select>
      {idTypeData.find((idt) => idt.value === selectedIdType)?.inputs}
    </>
  );
};

IdentifierInputs.propTypes = {
  namePrefix: PropTypes.string.isRequired,
};

export default IdentifierInputs;
