import React, { useState } from 'react';
import parse from 'html-react-parser';

interface MailCardProps {
  subject: string;
  body: string;
  category: string;
}

const MailCard: React.FC<MailCardProps> = ({ subject, body, category }) => {
  const [showFullBody, setShowFullBody] = useState(false);

  const handleBodyClick = () => {
    setShowFullBody(!showFullBody);
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2">
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryClasses(category)}`}>
          {category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-white">{subject}</h3>
        <p
          className={`text-gray-500 dark:text-gray-400 ${showFullBody ? '' : 'truncate-text'} cursor-pointer`}
          onClick={handleBodyClick}
        >
          {parse(showFullBody ? body : `${body.substring(0, 100)}...`)}
        </p>
        <div
          className="text-blue-500 cursor-pointer mt-2"
          onClick={handleBodyClick}
        >
          {showFullBody ? 'Show less' : 'Show more'}
        </div>
      </div>
    </div>
  );
};

const getCategoryClasses = (category: string) => {
  switch (category) {
    case 'important':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'promotional':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    case 'social':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'marketing':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
    case 'spam':
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
  }
};

export default MailCard;
