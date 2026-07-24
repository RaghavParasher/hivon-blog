const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyClYWG689v95368-q376yyfA-i78Xekv1U";
const genAI = new GoogleGenerativeAI(apiKey);

const models = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp"
];

async function test() {
  for (const modelName of models) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello, write a 1-word response.");
      const response = await result.response;
      console.log(`Success with ${modelName}:`, response.text());
    } catch (err) {
      console.error(`Failure with ${modelName}:`, err.message);
    }
  }
}

test();
