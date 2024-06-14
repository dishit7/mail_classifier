'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MailCard from './MailCard'; // Adjust the import path as necessary

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

  const getAccessToken = async () => {
    try {
      const accessTokenRes = await axios.get('https://api.hanmadishit74.workers.dev/getAccessToken', {
        withCredentials: true
      });
      setAccessToken(accessTokenRes.data.accessToken);
    } catch (error) {
      console.error('Error fetching access token:', error);
    }
  };

  const fetchEmails = async (pageToken: string | null = null) => {
    if (!accessToken) return;

    try {
      const response = await axios.get('https://api.hanmadishit74.workers.dev/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          pageToken
        }
      });
      const fetchedMails = response.data.emails;
      const newNextPageToken = response.data.nextPageToken;

      setMails(prevMails => [...prevMails, ...fetchedMails]);
      setNextPageToken(newNextPageToken);
    } catch (error) {
      console.error('Error fetching emails:', error);
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

  if (loading) return <p>Loading...</p>;

  return (
    <main className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Mail Classification</h1>
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
