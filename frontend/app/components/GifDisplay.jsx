'use client';

import { useState, useEffect } from 'react';

export default function GifDisplay({ id }) {
  const [gifUrl, setGifUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/gifMedia?id=${id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gif-${id}.gif`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading GIF:', err);
    }
  };

  useEffect(() => {
    const fetchGif = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/gifMedia?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch GIF');
        }

        // Create a blob URL from the response
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGifUrl(url);

        // Cleanup function to revoke the blob URL when component unmounts
        return () => URL.revokeObjectURL(url);
      } catch (err) {
        setError(err.message);
        console.error('Error loading GIF:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGif();
    }
  }, [id]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg w-full h-48"></div>;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Error loading GIF: {error}
      </div>
    );
  }

  if (!gifUrl) {
    return null;
  }

  return (
    <div className="relative w-full">
      <img
        src={gifUrl}
        alt="GIF content"
        className="w-full h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
        loading="lazy"
        onClick={handleDownload}
      />
    </div>
  );
} 