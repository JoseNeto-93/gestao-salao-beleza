
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!apiKey) {
  console.warn("⚠️  Aviso: API_KEY do Gemini ausente. A IA não processará mensagens reais.");
}

/**
 * Analisa a mensagem da cliente para gerar uma sugestão estruturada.
 */
export async function analyzeMessage(text) {
  if (!ai) {
    console.log("🤖 [MOCK IA] API Key não configurada. Retornando sugestão simulada.");
    // Simulação simples baseada em palavras-chave para teste
    const lowerText = text.toLowerCase();
    if (lowerText.includes("corte") || lowerText.includes("agendar") || lowerText.includes("cabelo")) {
      return {
        isBooking: true,
        clientName: "Cliente Teste",
        service: "Corte de Cabelo (Simulado)",
        date: new Date().toISOString().split('T')[0],
        time: "14:00",
        estimatedPrice: 80
      };
    }
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Updated to a stable model name if needed, or keep previous if sure
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

    const result = JSON.parse(response.text());
    return result.isBooking ? result : null;
  } catch (error) {
    console.error("Erro Gemini Backend:", error);
    return null;
  }
}
