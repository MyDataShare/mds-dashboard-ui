import { useEffect } from 'react';

const setTitle = (titleKeyOrValue, t) => {
  if (!t && !titleKeyOrValue) return;
  let newTitle;
  let titleWithoutPostfix;
  if (titleKeyOrValue) {
    newTitle = `${t(titleKeyOrValue)} - ${t('appTitle')}`;
    titleWithoutPostfix = t(titleKeyOrValue);
  } else {
    newTitle = t('appTitle');
    titleWithoutPostfix = newTitle;
  }
  // Use hardcoded title_announcer ID instead of constant to avoid dependency cycle...
  const titleAnnouncer = document.getElementById('title_announcer');
  if (titleAnnouncer) {
    titleAnnouncer.textContent = t('announcementNavigation', {
      title: titleWithoutPostfix,
    });
  }
  document.title = newTitle;
};

const useTitle = (title, t) => {
  useEffect(() => {
    setTitle(title, t);
  }, [title, t]);
};

export default useTitle;
