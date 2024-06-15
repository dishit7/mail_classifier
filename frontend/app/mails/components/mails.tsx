'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MailCard from './MailCard'; // Adjust the import path as necessary
import SkeletonCard from './Skeleton';
    
interface Mail {
  subject: string;
  body: string;
  category: string;
}

const MailsPage: React.FC = () => {
  const [mails, setMails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
   const getAccessToken = async () => {
    try {   
      const accessTokenRes = await axios.get('https://api.hanmadishit74.workers.dev/getAccessToken', {
        withCredentials: true
      });
      setAccessToken(accessTokenRes.data.accessToken);
    } catch (error) {
      console.error('Error fetching access token:', error);
      setError('Failed to fetch access token. Please refresh the page or try again later.');
    }
  };

  const fetchEmails = async (pageToken: string | null = null) => {
    if (!accessToken) return;

    try {
      console.log(`Current page token is ${pageToken}`);
      const response = await axios.get('https://api.hanmadishit74.workers.dev/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          pageToken
        }
      });
      const fetchedMails = response.data.emails;
      console.log(`fetched emails are ${fetchedMails}`)
      const newNextPageToken = response.data.nextPageToken;
      setMails(prevMails => [...prevMails, ...fetchedMails]);
      setNextPageToken(newNextPageToken);
      console.log(`next page token is ${newNextPageToken}`)
    } catch (error) {

      console.error('Error fetching emails:', error);
      setError('Failed to fetch emails. Please refresh the page or try again later.');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await getAccessToken();
      await fetchEmails();
      setLoading(false);
    };

    initialize();
  }, [accessToken]);

  const loadMoreEmails = () => {
    if (nextPageToken) {
      fetchEmails(nextPageToken);
    }
  };

  const refreshPage = () => {
    setError(null);
    setMails([]);
    setNextPageToken(null);
    getAccessToken();
  };

  const handleLogout = async () => {
    try {
      await axios.get('https://api.hanmadishit74.workers.dev/logout');
      window.location.href='/';
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 mx-auto text-center">Classified Mails</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Mail Classification</h1>

        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={refreshPage}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </main>
    );
  }

  return ( <main className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold">Mail Classification</h1>
    <button
      onClick={handleLogout}
      className="bg-black text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Logout
    </button>
  </div>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mails.map((mail, index) => (
          <MailCard key={index} subject={mail.subject} body={mail.body} category={mail.category} />
        ))}
      </div>
      {nextPageToken && (
        <button
          onClick={loadMoreEmails}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Load More
        </button>
      )}
    </main>
  );
};

export default MailsPage;
