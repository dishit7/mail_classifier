import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg overflow-hidden animate-pulse">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-center">
        <div className="bg-gray-200 dark:bg-gray-700 h-6 w-24 rounded-md mb-2 mx-auto"></div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-white">
          <div className="bg-gray-200 dark:bg-gray-700 h-8 mb-2 w-3/4"></div>
        </h3>
        <div className="text-gray-500 dark:text-gray-400 truncate-text cursor-pointer">
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-5/6 my-1"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-4/6"></div>
        </div>
        <div className="text-blue-500 cursor-pointer mt-2">
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-20"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
