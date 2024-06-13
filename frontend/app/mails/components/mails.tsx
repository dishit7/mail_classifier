'use client'
import React, { useEffect, useState } from 'react';

import axios from 'axios';
interface Mail {
    subject: string;
    body: string;
    category: string;
}

const MailsPage = () => {
    const [mails, setMails] = useState<Mail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAccessToken = async () => {
            try {
                const accessTokenRes = await axios.get('https://api.hanmadishit74.workers.dev/getAccessToken', {
                    withCredentials: true
                });
                const accessToken = accessTokenRes.data.accessToken;
                console.log(accessTokenRes.data)
                console.log(`access token is ${accessToken}`);

                const emailsRes = await axios.get('https://api.hanmadishit74.workers.dev/emails', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                const fetchedMails = emailsRes.data;
                setMails(fetchedMails);
                console.log(`fetched mails:`, fetchedMails);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching emails:', error);
            }
        };

        getAccessToken();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <div>Mails</div>
            <ul>
                {mails.map((mail, index) => (
                    <div key={index}>
                        <h1>{mail.subject}</h1>
                        <div>{mail.body}</div>
                        <h2>{mail.category}</h2>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default MailsPage;
