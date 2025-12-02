import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

// Helper to get the AI client securely
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Analyze spending habits
export const analyzeSpending = async (transactions: Transaction[]): Promise<string> => {
  const ai = getAiClient();
  const recentTransactions = transactions.slice(0, 50); // Analyze last 50 for performance context
  
  const prompt = `
    You are an expert financial advisor. Analyze the following transaction history and provide a brief, actionable report.
    Use Markdown formatting.
    
    Transactions:
    ${JSON.stringify(recentTransactions)}
    
    Focus on:
    1. Spending patterns.
    2. Potential areas to save money.
    3. A brief motivational summary.
    Keep the tone professional but encouraging.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "Unable to generate analysis at this time.";
};

// Parse natural language into a structured transaction
export const parseNaturalLanguageTransaction = async (input: string): Promise<Partial<Transaction> | null> => {
  const ai = getAiClient();
  
  const prompt = `
    Parse the following user input into a financial transaction JSON object.
    Input: "${input}"
    
    Current Date: ${new Date().toISOString()}
    
    Return a JSON object with keys: 'amount' (number), 'category' (string, infer best fit), 'description' (string), 'type' ('income' or 'expense').
    If the input is not a transaction, return null.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["income", "expense"] },
          },
          required: ["amount", "category", "type"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error parsing NL transaction:", error);
    return null;
  }
};
