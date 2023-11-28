import { useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Prompt } from 'react-router-dom';

import { useExitPrompt } from 'hooks';

const ExitPrompt = () => {
  const { isDirty, isSubmitSuccessful } = useFormState();
  const showPrompt = !isSubmitSuccessful && isDirty;
  const setShowExitPrompt = useExitPrompt(showPrompt);
  const { t } = useTranslation();
  // TODO: Can this effect be replaced with render-time logic?
  useEffect(() => {
    setShowExitPrompt(showPrompt);
  }, [showPrompt, setShowExitPrompt]);
  return (
    <Prompt when={showPrompt} message={t('textLeavingPageUnsavedChanges')} />
  );
};

export default ExitPrompt;
