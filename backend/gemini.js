
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Inicialização resiliente da IA
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Analisa mensagens via Gemini para extrair dados de agendamento.
 */
export async function analyzeMessage(text) {
  if (!apiKey) {
    console.warn("⚠️ Gemini API Key não configurada. IA desativada.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é um assistente de recepção para salões de beleza premium. 
                 Analise a mensagem: "${text}".
                 Extraia detalhes se for um agendamento ou interesse em serviço.
                 Considere hoje como: ${new Date().toISOString().split('T')[0]}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isBooking: { type: Type.BOOLEAN, description: "True se o cliente quer agendar algo" },
            clientName: { type: Type.STRING },
            service: { type: Type.STRING },
            date: { type: Type.STRING, description: "YYYY-MM-DD" },
            time: { type: Type.STRING, description: "HH:mm" },
            estimatedPrice: { type: Type.NUMBER }
          },
          required: ["isBooking"]
        }
      }
    });

    // O SDK retorna um objeto cuja propriedade .text contém o JSON gerado
    const result = JSON.parse(response.text);
    return result.isBooking ? result : null;
  } catch (error) {
    console.error("❌ Falha na análise Gemini:", error.message);
    return null;
  }
}
