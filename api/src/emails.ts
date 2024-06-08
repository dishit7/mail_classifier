
interface GmailMessage {
    id: string;
    threadId: string;
  }
  
  // Define the interface for the response when listing Gmail messages
  interface GmailMessagesResponse {
    messages: GmailMessage[];
    nextPageToken?: string;
    resultSizeEstimate: number;
  }
  
  // Define the interface for the detailed Gmail message data
  interface GmailMessageDetail {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    historyId: string;
    internalDate: string;
    payload: any;
    sizeEstimate: number;
    raw: string;
  }

  async function fetchEmails(accessToken: string, maxResults: number = 10): Promise<{ subject: string, body: string }[]> {
    console.log(`accessToken is ${accessToken}`);
    const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json() as GmailMessagesResponse;
    console.log('data is', JSON.stringify(data));

    if (data.messages) {
        const emails = await Promise.all(
            data.messages.map(async (msg: GmailMessage) => {
                const msgResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                const messageDetail = await msgResponse.json() as GmailMessageDetail;

                // Extract the subject from the headers
                const subjectHeader = messageDetail.payload.headers.find(header => header.name === 'Subject');
                const subject = subjectHeader ? subjectHeader.value : '(No subject)';

                // Extract the body
                const body = extractBody(messageDetail.payload);

                return { subject, body };
            })
        );
        return emails;
    } else {
        throw new Error('No messages found');
    }
}

function extractBody(payload: any): string {
    let body = '';

    if (payload.mimeType === 'text/plain') {
      body = payload.body.data ? atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/')) : '';
    } else if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain') {
              body = part.body.data ? atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/')) : '';
              break;
            } else if (part.parts) {
                body = extractBody(part);
                if (body) break;
            }
        }
    }

    return body;
}

export default fetchEmails