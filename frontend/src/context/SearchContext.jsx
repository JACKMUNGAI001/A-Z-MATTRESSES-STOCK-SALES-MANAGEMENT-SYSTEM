import React, { createContext, useState } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState(''); // Keeping date as an optional secondary filter

  const clearSearch = () => {
    setSearchQuery('');
    setSearchDate('');
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, searchDate, setSearchDate, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
};
