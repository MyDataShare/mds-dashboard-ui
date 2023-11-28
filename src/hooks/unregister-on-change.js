import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import usePrevious from './previous';

/**
 * Hook for unregistering an input when given value changes.
 *
 * Must be used in a component that is a child of the Form component.
 *
 * Useful for example when an input is dynamically replaced with another input with the same name
 * but different options like validations. React Hook Form seems to not do unregistering properly in
 * this case, so the new input would be left with the previous input's validations.
 *
 * @param watchValue When this value changes (from something else than undefined), given input is
 *                   unregistered.
 * @param inputName The name attribute of the input to unregister.
 */
const useUnregisterOnChange = (watchValue, inputName) => {
  const prevWatchValue = usePrevious(watchValue);
  const { unregister } = useFormContext();
  useEffect(() => {
    if (prevWatchValue !== undefined && prevWatchValue !== watchValue) {
      unregister(inputName);
    }
  }, [inputName, prevWatchValue, watchValue, unregister]);
};

export default useUnregisterOnChange;
