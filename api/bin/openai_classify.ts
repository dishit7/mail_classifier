import axios from 'axios';
import { Env } from '../env'; // Adjust the import according to your project structure

async function classifyEmailsWithGPT(emails: { subject: string, body: string }[]): Promise<{ subject: string, body: string, category: string }[]> {
    const apiKey = Env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OpenAI API key is missing');
    }

    const apiUrl = 'https://api.openai.com/v1/completions';

    const classifications = await Promise.all(emails.map(async (email) => {
        const maxRetries = 5;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const response = await axios.post(apiUrl, {
                    model: "gpt-3.5", // Use the appropriate model
                    prompt: `Classify the following email into one of these categories: important, promotional, social, marketing, spam.\n\nEmail subject: ${email.subject}\nEmail body: ${email.body}`,
                    max_tokens: 60
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    }
                });
                console.log(`apiurl is ${apiUrl}`)
                if (response.status !== 200) {
                    throw new Error(`OpenAI API request failed with status ${response.status}`);
                }

                const category = response.data.choices[0].text.trim();
                return { ...email, category };
            } catch (error:any) {
                if (error.response?.status === 429) {
                    attempt++;
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.warn(`Rate limited by OpenAI API, retrying in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('Error classifying email:', error);
                    console.log(`reason of classification error is  ${error}`)
                    return { ...email, category: 'classification_error' }; // Fallback category
                }
            }
        }

        // If all retries fail, return an error category
        return { ...email, category: 'classification_failed' };
    }));

    return classifications;
}

export default classifyEmailsWithGPT;


 