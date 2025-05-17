'use client';

import { useState, useEffect } from 'react';

export default function GifUpdateCard({ id, name: initialName, descriptions: initialDescription, mediaDirectoryFileName, gifDeletedTrigger, setGifDeletedTrigger }) {
  const [gifUrl, setGifUrl] = useState(null);
  const [name, setName] = useState(initialName === null ? "" : initialName);
  const [description, setDescription] = useState(
    initialDescription === null ? [""] : 
    Array.isArray(initialDescription) ? initialDescription : [initialDescription]
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchGif = async () => {
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const response = await fetch(`${basePath}/api/gifMedia?id=${id}`);
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
    // Check if any description is empty
    if (description.some(desc => !desc.trim()) || description.length < 1) {
      alert('Descriptions cannot be empty');
      return;
    }

    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      const nameParameter = name.trim() !== "" ? `&name=${encodeURIComponent(name)}` : "";
      const descriptionsParam = description.map(desc => 
        `description=${encodeURIComponent(desc)}`
      ).join('&');
      console.log(descriptionsParam)
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const response = await fetch(`${basePath}/api/admin/update?id=${id}&${descriptionsParam}${nameParameter}`, {
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
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const response = await fetch(`${basePath}/api/admin/delete?id=${id}`, {
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

  const addDescription = () => {
    setDescription([...description, '']);
  };

  const removeDescription = (index) => {
    if (description.length > 1) {
      setDescription(description.filter((_, i) => i !== index));
    }
  };

  const updateDescription = (index, value) => {
    const newDescriptions = [...description];
    newDescriptions[index] = value;
    setDescription(newDescriptions);
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
        
        {/* Description Inputs */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-medium">Descriptions</label>
          {description.map((desc, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                className="border border-gray-300 rounded-md p-2 flex-grow"
                placeholder={`Enter reaction description ${index + 1}`}
                value={desc}
                onChange={(e) => updateDescription(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdate();
                  }
                }}
              />
              {description.length > 1 && (
                <button
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  onClick={() => removeDescription(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors mt-2 cursor-pointer"
            onClick={addDescription}
          >
            Add Description
          </button>
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