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

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const accessTokenRes = await axios.get('https://api.hanmadishit74.workers.dev/getAccessToken', {
          withCredentials: true
        });
        const accessToken = accessTokenRes.data.accessToken;

        const emailsRes = await axios.get('https://api.hanmadishit74.workers.dev/emails', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        const fetchedMails = emailsRes.data;
        setMails(fetchedMails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    getAccessToken();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Mail Classification</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mails.map((mail, index) => (
          <MailCard key={index} subject={mail.subject} body={mail.body} category={mail.category} />
        ))}
      </div>
    </main>
  );
};

export default MailsPage;
