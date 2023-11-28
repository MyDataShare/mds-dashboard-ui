import { useMemo, useState } from 'react';

const useItemSelection = () => {
  const [isSelectActivated, _setIsSelectActivated] = useState(false);
  const [selectedItems, _setSelectedItems] = useState([]);
  const setSelectedItems = (items) => {
    _setSelectedItems([...new Set(items)]);
  };
  return useMemo(() => {
    const selectItem = (key) => {
      const newSelectedItems = selectedItems.includes(key)
        ? selectedItems.filter((r) => r !== key)
        : [...selectedItems, key];
      setSelectedItems(newSelectedItems);
    };
    const selectAllItems = (allItems, keyGetter) => {
      const keys = allItems.map((item) => keyGetter(item));
      setSelectedItems(selectedItems.concat(keys));
    };
    const setIsSelectActivated = (value) => {
      setSelectedItems([]);
      _setIsSelectActivated(value);
    };
    return {
      isSelectActivated,
      setIsSelectActivated,
      selectAllItems,
      selectItem,
      selectedItems,
      setSelectedItems,
    };
  }, [isSelectActivated, selectedItems]);
};

export default useItemSelection;
