import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateSummary(text: string) {
  const apiKey = (process.env.GOOGLE_AI_API_KEY || "").trim();

  // High-quality local algorithmic summarizer fallback
  const generateFallbackSummary = (content: string) => {
    // Strip markdown headers, bolding, links, etc.
    const cleanText = content
      .replace(/[#*`_\[\]()\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Split into sentences
    const sentences = cleanText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20); // filter out short fragments
    
    if (sentences.length === 0) {
      return cleanText.substring(0, 180) + "...";
    }
    
    // Take the top 3 sentences (the introduction sentences)
    const summarySentences = sentences.slice(0, 3);
    let summary = summarySentences.join(". ") + ".";
    
    // Hard limit character length to keep it concise
    if (summary.length > 250) {
      summary = summary.substring(0, 247) + "...";
    }
    return summary;
  };

  // If no API key is set, use the local fallback summarizer
  if (!apiKey || apiKey === "your_gemini_key" || apiKey.startsWith("your_")) {
    console.warn("GOOGLE_AI_API_KEY is missing. Using local fallback summarizer.");
    return generateFallbackSummary(text);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Trying the most likely 1.5 and 2.0 model names in order (prioritizing 1.5 flash)
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash", "gemini-pro"];

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
      console.warn(`Model ${modelName} failed, trying next fallback:`, error.message);
    }
  }

  // If all API calls fail (like the 429 quota error), use the local fallback summarizer
  console.warn("All Gemini API models failed. Using local fallback summarizer.");
  return generateFallbackSummary(text);
}
