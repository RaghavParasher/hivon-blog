import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateSummary(text: string) {
  const apiKey = (process.env.GOOGLE_AI_API_KEY || "").trim();
  if (!apiKey || apiKey === "your_gemini_key") {
    return "[AI Error: GOOGLE_AI_API_KEY is empty or not set]";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Trying the most likely 2.0 and 1.5 model names in order
  const models = ["gemini-2.0-flash-exp", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
  let lastError = "None";

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
      lastError = error.message;
    }
  }

  return `[AI Error: ${lastError}] (Check if 'Generative Language API' is enabled for this key) Content: ${text.substring(0, 50)}...`;
}
