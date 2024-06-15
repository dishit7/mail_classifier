import { GoogleGenerativeAI } from "@google/generative-ai";
import { Env_Vars } from "../env";
const gem_api =  Env_Vars.GEMINI_API;  
const genAI = new GoogleGenerativeAI(gem_api);

async function classifyEmailsWithGemini(emails: { subject: string, body: string }[]): Promise<{ subject: string, body: string, category: string }[]>  {
    const classifications = [];

     for (const email of emails) {
        try {
             const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Classify the following email into one of these categories: important, promotional, social, marketing, spam.\n\nEmail subject: ${email.subject} if cant classify return unexpected category`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = await response.text();
 
            const category = text.trim();

             classifications.push({ ...email, category });
        } catch (error) {
             console.log('Error classifying email:', error);
            classifications.push({ ...email, category: 'classification_error' });
        }
    }

    return classifications;
}

export default classifyEmailsWithGemini;


 