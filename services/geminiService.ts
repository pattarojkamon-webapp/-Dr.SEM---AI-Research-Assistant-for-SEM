import { GoogleGenAI, Type } from "@google/genai";
import { DR_SEM_SYSTEM_PROMPT } from '../constants';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key is missing. Please select an API key.");
    }
    return new GoogleGenAI({ apiKey });
};

export const sendMessageToGemini = async (
  history: { role: string; parts: any[] }[],
  message: string,
  attachment?: { mimeType: string; data: string } | null
): Promise<{ answer: string, suggestedQuestions: string[], relatedQuestions: string[] }> => {
  try {
    const client = getClient();
    
    // Define the schema for structured output
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
          answer: { 
              type: Type.STRING, 
              description: "The main response to the user's query in Markdown format. Be comprehensive and academic." 
          },
          suggestedQuestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 important, direct follow-up questions that delve deeper into the specific topic discussed. Use the same language as the conversation."
          },
          relatedQuestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 broad or adjacent questions that expand the scope of the research or relate to other SEM topics. Use the same language as the conversation."
          }
        },
        required: ["answer", "suggestedQuestions", "relatedQuestions"]
    };

    // We create a chat session
    const chat = client.chats.create({
      model: 'gemini-2.5-flash', 
      config: {
        systemInstruction: DR_SEM_SYSTEM_PROMPT,
        temperature: 0.7, 
        responseMimeType: "application/json",
        responseSchema: responseSchema
      },
      history: history.map(h => ({
          role: h.role,
          parts: h.parts
      }))
    });

    // If there is an attachment (image), we send it as a separate part
    let contentParts: any[] = [{ text: message }];
    
    if (attachment) {
        // Strip base64 header if present
        const base64Data = attachment.data.split(',')[1] || attachment.data;
        contentParts.unshift({
            inlineData: {
                mimeType: attachment.mimeType,
                data: base64Data
            }
        });
    }

    const response = await chat.sendMessage({
      message: contentParts.length === 1 ? contentParts[0].text : contentParts
    });

    const responseText = response.text || "{}";
    try {
        const jsonResponse = JSON.parse(responseText);
        return {
            answer: jsonResponse.answer || responseText,
            suggestedQuestions: jsonResponse.suggestedQuestions || [],
            relatedQuestions: jsonResponse.relatedQuestions || []
        };
    } catch (e) {
        console.warn("Failed to parse JSON response, falling back to raw text", e);
        return {
            answer: responseText,
            suggestedQuestions: [],
            relatedQuestions: []
        };
    }

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};