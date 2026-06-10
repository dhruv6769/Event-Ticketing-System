import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(() => {
    return sessionStorage.getItem('activeCategory') || 'All';
  });

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, activeCategory, setActiveCategory }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
