'use client';

import { useState, useEffect } from "react";
import GifUpdateCard from "./GifUpdateCard";

export default function GifCardGrid() {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [gifDeletedTrigger, setGifDeletedTrigger] = useState(false);  
  const [onlyNullDescription, setOnlyNullDescription] = useState(false);

  useEffect(() => {
    const fetchGifs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gif?page=${page}&pageSize=10&onlyNullDescription=${onlyNullDescription}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch GIFs');
        }

        const data = await response.json();
        setGifs(data.gifs);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGifs();
  }, [page, onlyNullDescription, gifDeletedTrigger]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6 flex items-center">
        <input
          type="checkbox"
          id="nullDescription"
          checked={onlyNullDescription}
          onChange={(e) => setOnlyNullDescription(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="nullDescription">Show only GIFs without descriptions</label>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {gifs.map((gif) => (
          <GifUpdateCard 
            key={gif.id}
            id={gif.id}
            name={gif.name}
            descriptions={gif.descriptions}
            mediaDirectoryFileName={gif.mediaDirectoryFileName}
            gifDeletedTrigger={gifDeletedTrigger}
            setGifDeletedTrigger={setGifDeletedTrigger} 
          />
        ))}
      </div>
      
      {/* Pagination controls */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page <= 0}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="py-2">
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}