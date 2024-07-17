import { useState, useEffect } from "react";

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchItemResponseType[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistorySearch = () => {
    const historyString = localStorage.getItem("historysearch");
    const history: SearchItemResponseType[] = historyString
      ? JSON.parse(historyString)
      : [];
    setHistory(history);
  };

  const addToHistorySearch = (item: SearchItemResponseType) => {
    const historyString = localStorage.getItem("historysearch");
    const history: SearchItemResponseType[] = historyString
      ? JSON.parse(historyString)
      : [];
    const newHistory = [item, ...history];
    localStorage.setItem("historysearch", JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const deleteItemFromHistory = (item: SearchItemResponseType) => {
    const historyString = localStorage.getItem("historysearch");
    const history: SearchItemResponseType[] = historyString
      ? JSON.parse(historyString)
      : [];
    const newHistory = history.filter(
      (historyItem) =>
        historyItem.location.x !== item.location.x &&
        historyItem.location.y !== item.location.y
    );
    localStorage.setItem("historysearch", JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const deleteAllItemsHistory = () => {
    localStorage.removeItem("historysearch");
    setHistory([]);
    setShowHistory(false);
  };

  useEffect(() => {
    loadHistorySearch();
  }, []);

  return {
    history,
    showHistory,
    setShowHistory,
    addToHistorySearch,
    deleteItemFromHistory,
    deleteAllItemsHistory,
    loadHistorySearch,
  };
};
