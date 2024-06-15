import { htmlToText } from 'html-to-text';

interface GmailMessage {
    id: string;
    threadId: string;
}

 interface GmailMessagesResponse {
    messages: GmailMessage[];
    nextPageToken?: string;
    resultSizeEstimate: number;
}

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

 async function fetchEmails(accessToken: string, pageToken: string | null = null, maxResults: number = 4): Promise<{ emails: { subject: string, body: string }[], nextPageToken: string | null }> {
   try{
    let url = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
    if (pageToken) {
        url += `&pageToken=${pageToken}`;
    }

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json() as GmailMessagesResponse;
    if (!data.messages) {
        throw new Error('No messages found');
    }

    const emails = await Promise.all(
        data.messages.map(async (msg: GmailMessage) => {
            const msgResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const messageDetail = await msgResponse.json() as GmailMessageDetail;

            const subjectHeader = messageDetail.payload.headers.find(header => header.name === 'Subject');
            const subject = subjectHeader ? subjectHeader.value : '(No subject)';

            const body = extractBody(messageDetail.payload);

            const cleanBody = removeWeirdSymbols(body);
            const plainTextBody = htmlToText(cleanBody, {
                wordwrap: 130,
                baseElements: { selectors: ['body'] },
                selectors: [
              
                    { selector: 'img', format: 'skip' },
                    { selector: 'div', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
                    { selector: 'p', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } }
                ],
                limits: {
                    ellipsis: '...',
                    maxInputLength: 1000
                },
                longWordSplit: { wrapCharacters: ['/', '_', '-'], forceWrapOnLimit: true },
                preserveNewlines: true
            });

          //  const clickableBody = makeLinksClickable(plainTextBody);

            return { subject, body: plainTextBody };
        })
    );

    return { emails, nextPageToken: data.nextPageToken || null };
   }catch(err){
    console.log(err)
   }
}

// Function to extract email body based on MIME type
function extractBody(payload: any): string {
    let body = '';

    if (payload.mimeType === 'text/plain') {
        body = payload.body.data ? atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/')) : '';
    } else if (payload.mimeType === 'text/html') {
        body = payload.body.data ? atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/')) : '';
    } else if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
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
/*
// Function to make URLs clickable
function makeLinksClickable(body: string): string {
    // Regular expression to match URLs
    const urlRegex = /https?:\/\/[^\s]+/g;

    // Replace URLs with anchor tags
    const formattedBody = body.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });

    return formattedBody;
}*/

// Function to remove weird symbols and non-printable characters
function removeWeirdSymbols(input: string): string {
    // Define a regex pattern to match non-printable ASCII characters and weird symbols
    const regex = /[^\x20-\x7E]/g;

    // Replace matched characters with an empty string
    const cleaned = input.replace(regex, '');

    return cleaned;
}

export default fetchEmails;
