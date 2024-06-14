import { GoogleGenerativeAI } from "@google/generative-ai";
const gem_api = "AIzaSyCQNW2RNfF8nGFfxXOGKXUk0VtREINOnto"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(gem_api);

async function classifyEmailsWithGemini(emails: { subject: string, body: string }[]): Promise<{ subject: string, body: string, category: string }[]>  {
    const classifications = [];

    // Loop through each email
    for (const email of emails) {
        try {
            // Generate content using Google Generative AI
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Classify the following email into one of these categories: important, promotional, social, marketing, spam.\n\nEmail subject: ${email.subject}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = await response.text();

            // Determine the category based on the generated response
            // For simplicity, let's assume it always returns a single category
            const category = text.trim();

            // Push the email with its category to the classifications array
            classifications.push({ ...email, category });
        } catch (error) {
            // Handle any errors during classification
            console.error('Error classifying email:', error);
            classifications.push({ ...email, category: 'classification_error' });
        }
    }

    return classifications;
}

export default classifyEmailsWithGemini;
