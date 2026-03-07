import React, { createContext, useState } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' or 'date'

  const clearSearch = () => {
    setSearchQuery('');
    setSearchDate('');
  };

  return (
    <SearchContext.Provider value={{ 
      searchQuery, setSearchQuery, 
      searchDate, setSearchDate, 
      searchType, setSearchType,
      clearSearch 
    }}>
      {children}
    </SearchContext.Provider>
  );
};
