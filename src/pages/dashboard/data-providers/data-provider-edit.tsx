import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import DataProviderForm from './data-provider-form';
import { fetchDataProvider } from 'api/get';
import { patchDataProvider } from 'api/modify';
import Breadcrumbs from 'components/breadcrumbs';
import Chip from 'components/chip';
import Flag from 'components/flag';
import LabeledValue from 'components/labeled-value';
import Loading from 'components/loading';
import { useAuth } from 'context/auth';
import { useTitle } from 'hooks';
import { IdTypeData } from 'types/index';
import { QUERY_ERR_MSG_KEY } from 'util/constants';
import { formatDate } from 'util/date';
import { getIdTypeData, sortIdTypeData } from 'util/form';
import { getApiObject } from 'util/mds-api';

interface MatchParams {
  uuid: string;
}

const DataProviderEdit = ({ match }: RouteComponentProps<MatchParams>) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { user } = useAuth();
  useTitle('pageTitleDataProviderEdit', t);
  const { uuid } = match.params;
  const queryKey: [string, { uuid: string }] = ['dataProvider', { uuid }];
  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey,
    queryFn: fetchDataProvider,
  });

  if (isLoading) {
    return (
      <>
        <Breadcrumbs />
        <h1 id="heading-edit-dp">{t('headingDataProviderEdit')}</h1>
        <Loading />
      </>
    );
  }

  if (isError || !isSuccess) {
    throw new Error(QUERY_ERR_MSG_KEY);
  }

  const dataProvider = getApiObject(data.data_providers);
  if (
    dataProvider === null ||
    dataProvider.organization_uuid !== user.organization.uuid
  ) {
    throw new Error('errorNoPermission');
  }

  const idTypeData = getIdTypeData(t, 'dataProvider');
  const sortedIdTypes = dataProvider['input_id_types.uuid']
    .map((idTypeUuid) =>
      Object.values(idTypeData).find((d) => d.uuidValue === idTypeUuid)
    )
    .filter((a): a is IdTypeData => a !== undefined)
    .sort((a, b) => sortIdTypeData(t, a, b));
  return (
    <>
      <Breadcrumbs />
      <h1 id="heading-edit-dp">{t('headingDataProviderEdit')}</h1>
      <LabeledValue label={t('uuid')} value={dataProvider.uuid} />
      <LabeledValue
        label={t('input_id_types')}
        value={
          dataProvider['input_id_types.uuid'].length > 0 ? (
            <Chip.Area>
              {sortedIdTypes.map((idt) => {
                const label = t(idt.name);
                return (
                  <Chip key={idt.uuidValue}>
                    {idt.flag ? <Flag alpha2={idt.flag} text={label} /> : label}
                  </Chip>
                );
              })}
            </Chip.Area>
          ) : null
        }
      />
      <LabeledValue
        label={t('created')}
        value={formatDate(dataProvider.created)}
      />
      <LabeledValue
        label={t('updated')}
        value={formatDate(dataProvider.updated)}
      />
      <DataProviderForm
        dataProvider={dataProvider}
        metadatas={data.metadatas}
        mutationFn={patchDataProvider}
        invalidateQueries={[queryKey, 'dataProviders']}
        onSuccess={() => history.replace('.')}
        onDeleteSuccess={() => history.replace('/dataProviders')}
      />
    </>
  );
};

DataProviderEdit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default DataProviderEdit;
