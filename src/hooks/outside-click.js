import { useEffect } from 'react';

const useOutsideClick = (ref, callback, enabled = true) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (enabled && ref.current && !ref.current.contains(event.target)) {
        callback(event);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, enabled, ref]);
};

export default useOutsideClick;
