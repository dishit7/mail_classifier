import React, { useState } from 'react';
import parse from 'html-react-parser';

interface MailCardProps {
  subject: string;
  body: string;
  category: string;
}

const MailCard: React.FC<MailCardProps> = ({ subject, body, category }) => {
  const [showFullBody, setShowFullBody] = useState(false);
  let   customMessage='For a better experience, please view this email in Gmail.'
  const handleBodyClick = () => {
    setShowFullBody(!showFullBody);
  };

  const { categoryClass, categoryBgClass } = getCategoryClasses(category);
  const displayBody = () => {
    console.log(`body after trim is ${body.trim()}`)
    if (body.trim() === "") {
      return customMessage;
    }
    return showFullBody ? body : `${body.substring(0, 100)}...`;
  };

 
return (
  <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg overflow-hidden">
    <div className={`bg-gray-100 dark:bg-gray-800 px-4 py-2 text-center ${categoryBgClass}`}>
      <span className={`px-2 py-1 rounded-md text-xl font-medium dark:text-white ${categoryClass}`}>
        {category}
      </span>
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 dark:text-white">{subject}</h3>
      <p
        className={`text-gray-500 dark:text-gray-400 ${showFullBody ? '' : 'truncate-text'} cursor-pointer`}
        onClick={handleBodyClick}
      >
        {parse(displayBody())}
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
  let categoryClass = '';
  let categoryBgClass = '';
debugger ;
  switch (category) {
    case 'Important':
      categoryClass = 'text-green-800  ';
      categoryBgClass = 'bg-green-100 dark:bg-red-700				';
      break;
    case 'Promotional':
      categoryClass = 'text-blue-800  ';
      categoryBgClass = 'bg-blue-100 dark:bg-blue-600';
      break;
    case 'Social':
      categoryClass = 'text-yellow-800  ';
      categoryBgClass = 'bg-yellow-100 dark:bg-yellow-500';
      break;
    case 'Marketing':
      categoryClass = 'text-purple-800  ';
      categoryBgClass = 'bg-purple-100 dark:bg-purple-600';
      break;
    case 'Spam':
      categoryClass = 'text-red-800  ';
      categoryBgClass = 'bg-red-100 dark:bg-orange-600';
      break;
    default:
      categoryClass = 'text-gray-800 dark:text-gray-200';
      categoryBgClass = 'bg-gray-100 dark:bg-gray-600';
      break;
  }

  return { categoryClass, categoryBgClass };
};

export default MailCard;
