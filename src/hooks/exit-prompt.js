import { useEffect, useState } from 'react';

const useExitPrompt = (enabled) => {
  const [showExitPrompt, setShowExitPrompt] = useState(enabled);
  useEffect(() => {
    window.onbeforeunload = (event) => {
      if (showExitPrompt) {
        const e = event || window.event;
        e.preventDefault();
        if (e) {
          e.returnValue = '';
        }
        return '';
      }
      return null;
    };
    return () => {
      // Remove event handler when unmounted
      window.onbeforeunload = () => undefined;
    };
  }, [showExitPrompt, enabled]);

  return setShowExitPrompt;
};

export default useExitPrompt;
