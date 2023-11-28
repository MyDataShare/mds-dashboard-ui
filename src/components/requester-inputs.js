import React from 'react';
import { useTranslation } from 'react-i18next';

import Input from 'components/input';
import LabeledValue from 'components/labeled-value';
import TextArea from 'components/text-area';
import { useAuth } from 'context/auth';

const RequesterInputs = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <>
      <h2>{t('headingRequester')}</h2>
      <LabeledValue label={t('organization')} value={user?.organization.name} />
      <Input
        id="requesterEmailInput"
        name="data.contact_email"
        label={t('labelContactEmail')}
        type="email"
        required
      />
      <Input
        id="requesterPhoneInput"
        name="data.contact_phone"
        label={t('labelContactPhone')}
        type="tel"
        required
      />
      <TextArea
        id="commentsInput"
        name="data.comments"
        label={t('labelComments')}
      />
    </>
  );
};

export default RequesterInputs;
