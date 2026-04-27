import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateSummary(text: string) {
  try {
    // We use gemini-1.5-flash for maximum compatibility if needed, 
    // but 2.0-flash is faster if available.
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Write a professional, engaging summary of the following blog post. 
    The summary should be around 150-200 words long and highlight the main takeaways.
    
    Blog Post Content:
    ${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summaryText = response.text();
    
    if (!summaryText || summaryText.length < 10) {
      throw new Error("AI returned an empty or too short summary");
    }
    
    return summaryText;
  } catch (error: any) {
    console.error("AI Summary generation failed:", error.message);
    // Return a simple fallback so the UI isn't empty
    return "This post explores " + text.substring(0, 150).replace(/[^\w\s]|[\n\r]/g, " ") + "... [AI Summary temporarily unavailable]";
  }
}
