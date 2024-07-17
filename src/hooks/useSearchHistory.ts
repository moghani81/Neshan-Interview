import { useState, useEffect } from "react";

export const useSearchHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistorySearch = () => {
    const historyString = localStorage.getItem("historysearch");
    const history: any[] = historyString ? JSON.parse(historyString) : [];
    setHistory(history);
  };

  const addToHistorySearch = (item: any) => {
    const historyString = localStorage.getItem("historysearch");
    const history: any[] = historyString ? JSON.parse(historyString) : [];
    const newHistory = [...history, item];
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
    deleteAllItemsHistory,
    loadHistorySearch,
  };
};
