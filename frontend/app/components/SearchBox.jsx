'use client';

import { useState } from 'react';
import GifDisplay from './GifDisplay';

export default function SearchArea() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // list of strings
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    try {
      if (searchQuery.length === 0) {
        return;
      }
      setSearchResults([]);
      setIsLoading(true);
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const response = await fetch(`${basePath}/api/searchGif?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="How are you feeling?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className={`w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 cursor-pointer'
          }`}
        >
          {isLoading ? (
            <svg
              className="w-5 h-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
          <span>{isLoading ? 'Searching...' : 'Search'}</span>
        </button>
      </div>
      <div className="min-h-[200px]">
        {searchResults.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  
            {searchResults.map((result) => (
              <GifDisplay key={result} id={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 