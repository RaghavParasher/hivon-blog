import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateSummary(text: string) {
  let lastError = "Unknown error";
  let availableModels: string[] = [];

  try {
    // Attempt to list available models to see what this key can do
    // Note: Some keys might not have permission to list models
    // but we can try it for debugging
    // @ts-ignore
    const modelList = await genAI.getGenerativeModel({ model: "gemini-pro" }).listModels();
    // @ts-ignore
    availableModels = modelList.models.map((m: any) => m.name);
  } catch (e) {
    availableModels = ["Could not list models"];
  }

  const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-flash-latest"];
  
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `Summarize: ${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      lastError = error.message;
    }
  }

  return `[AI Error: ${lastError}] [Allowed Models: ${availableModels.join(", ")}] Content: ${text.substring(0, 50)}...`;
}
