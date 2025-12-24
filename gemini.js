
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analisa a mensagem da cliente para gerar uma sugestão estruturada.
 */
export async function analyzeMessage(text) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é um analista de agendamentos para salões de beleza. 
                 Mensagem da cliente: "${text}".
                 Extraia os dados técnicos se for um pedido de serviço.
                 Data de hoje: ${new Date().toISOString().split('T')[0]}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isBooking: { type: Type.BOOLEAN, description: "True se for um pedido de agendamento" },
            clientName: { type: Type.STRING },
            service: { type: Type.STRING },
            date: { type: Type.STRING, description: "Formato YYYY-MM-DD" },
            time: { type: Type.STRING, description: "Formato HH:mm" },
            estimatedPrice: { type: Type.NUMBER }
          },
          required: ["isBooking"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result.isBooking ? result : null;
  } catch (error) {
    console.error("Erro Gemini Backend:", error);
    return null;
  }
}
