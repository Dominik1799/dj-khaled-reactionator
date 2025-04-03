'use client';

import { useState, useEffect } from 'react';

export default function GifUpdateCard({ id, name: initialName, description: initialDescription, mediaDirectoryFileName, gifDeletedTrigger, setGifDeletedTrigger }) {
  const [gifUrl, setGifUrl] = useState(null);
  const [name, setName] = useState(initialName === null ? "" : initialName);
  const [description, setDescription] = useState(initialDescription === null ? "" : initialDescription);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchGif = async () => {
      try {
        const response = await fetch(`/api/gifMedia?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch GIF');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGifUrl(url);
      } catch (error) {
        console.error('Error loading GIF:', error);
      }
    };

    fetchGif();

    // Cleanup function to revoke object URL
    return () => {
      if (gifUrl) {
        URL.revokeObjectURL(gifUrl);
      }
    };
  }, [id]);

  const handleUpdate = async () => {
    if (!description.trim()) {
      alert('Description cannot be empty');
      return;
    }

    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      const nameParameter = name.trim() !== "" ? `&name=${encodeURIComponent(name)}` : "";
      const response = await fetch(`/api/admin/update?id=${id}&description=${encodeURIComponent(description)}${nameParameter}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to update GIF');
      }
      
      setUpdateSuccess(true);

    } catch (error) {
      console.error('Error updating GIF:', error);
      alert('Failed to update GIF');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this GIF?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete GIF');
      }
      setGifDeletedTrigger(!gifDeletedTrigger);
      
    } catch (error) {
      console.error('Error deleting GIF:', error);
      alert('Failed to delete GIF');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex flex-col gap-4">
        {/* GIF Display Area */}
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          {gifUrl ? (
            <img 
              src={gifUrl} 
              alt={name} 
              className="object-contain w-full h-full"
            />
          ) : (
            <span className="text-gray-500">Loading GIF...</span>
          )}
        </div>
        
        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-gray-700 font-medium">Name</label>
          <input
            type="text"
            id="name"
            className="border border-gray-300 rounded-md p-2"
            placeholder="Enter reaction name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        {/* Description Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-gray-700 font-medium">Description</label>
          <input
            type="text"
            id="description"
            className="border border-gray-300 rounded-md p-2"
            placeholder="Enter reaction description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUpdate();
              }
            }}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4 mt-2">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer disabled:bg-blue-300"
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer disabled:bg-red-300"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        {/* Success Message */}
        {updateSuccess && (
          <div className="mt-2 text-green-600 text-center">
            GIF updated successfully!
          </div>
        )}
      </div>
    </div>
  );
} 