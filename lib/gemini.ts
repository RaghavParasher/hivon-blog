import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateSummary(text: string) {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
  
  for (const modelName of models) {
    try {
      console.log(`Attempting summary with ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `Write a professional, engaging summary of the following blog post. 
      The summary should be around 150-200 words long and highlight the main takeaways.
      
      Blog Post Content:
      ${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summaryText = response.text();
      
      if (summaryText && summaryText.length > 10) {
        return summaryText;
      }
    } catch (error: any) {
      console.error(`Model ${modelName} failed:`, error.message);
      // Continue to the next model in the list
    }
  }

  // Final text-based fallback if all AI models fail
  return "This post explores " + text.substring(0, 150).replace(/[^\w\s]|[\n\r]/g, " ") + "... [AI Summary temporarily unavailable]";
}
