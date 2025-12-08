import { useState, useMemo } from 'react';

/**
 * Reusable search/filter logic
 * Works with any data type
 */
export const useSearchFilter = <T>(
  data: T[],
  searchFields: (item: T) => string[]
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      searchFields(item).some(field => 
        field.toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
};