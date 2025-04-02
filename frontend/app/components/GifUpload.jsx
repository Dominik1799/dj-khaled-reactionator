'use client';

import { useState } from "react";

export default function GifUpload() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
      setSelectedFiles(Array.from(e.target.files));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      setIsUploading(true);
      
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`gifs`, file);
      });
  
      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        // Clear the form after successful upload
        setSelectedFiles([]);
        alert('GIFs uploaded successfully!');
      } catch (error) {
        console.error('Error uploading GIFs:', error);
        alert('Failed to upload GIFs');
      } finally {
        setIsUploading(false);
      }
    };
  return (
    <div>
        <form onSubmit={handleSubmit} className="w-full max-w-md mb-8">
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/gif"
            multiple
            onChange={handleFileChange}
            className="border p-2 rounded"
            disabled={isUploading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                </>
            ) : (
                'Upload GIFs'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}