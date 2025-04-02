'use client';

export default function GifUpdateCard({ id }) {
  
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 mb-4">
    <div className="flex flex-col gap-4">
      {/* GIF Display Area */}
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        {/* Replace with actual GIF */}
        <span className="text-gray-500">GIF Preview</span>
      </div>
      
      {/* Name Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-gray-700 font-medium">Name</label>
        <input
          type="text"
          id="name"
          className="border border-gray-300 rounded-md p-2"
          placeholder="Enter reaction name"
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
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4 mt-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
          Update
        </button>
        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer">
          Delete
        </button>
      </div>
    </div>
  </div>
  );
} 