import React, { createContext, useState } from "react";

export const CustomizeContext = createContext();

export function CustomizeProvider({ children }) {
  const [customizeLog, setCustomizeLog] = useState([]);

  // Add item to the customize log
  const addToCustomizeLog = (item) => {
    setCustomizeLog((prev) => [...prev, item]);
  };

  // Remove item by matching type + _id
  const removeFromCustomizeLog = (id, type) => {
    setCustomizeLog((prev) =>
      prev.filter(
        (entry) => !(entry.data._id === id && entry.type === type)
      )
    );
  };

  // Toggle "crossedOut" property on a specific item
  const toggleCrossOutItem = (id, type) => {
    setCustomizeLog((prev) =>
      prev.map((entry) => {
        if (entry.data._id === id && entry.type === type) {
          return { ...entry, crossedOut: !entry.crossedOut };
        }
        return entry;
      })
    );
  };

  return (
    <CustomizeContext.Provider
      value={{ customizeLog, addToCustomizeLog, removeFromCustomizeLog, toggleCrossOutItem }}
    >
      {children}
    </CustomizeContext.Provider>
  );
}
