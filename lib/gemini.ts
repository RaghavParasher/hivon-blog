import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateSummary(text: string) {
  // Try classic model names that are more likely to be available in all regions/accounts
  const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-flash-latest"];
  let lastError = "Unknown error";
  
  for (const modelName of models) {
    try {
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
      lastError = error.message;
    }
  }

  // Final fallback with more info
  if (apiKey === "") {
    lastError = "API Key is missing in environment variables";
  }
  
  return `[AI Error: ${lastError}] This post explores ` + text.substring(0, 150).replace(/[^\w\s]|[\n\r]/g, " ") + "...";
}
