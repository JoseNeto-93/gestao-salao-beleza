
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function extractAppointmentFromText(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extraia informações de agendamento de salão deste texto de WhatsApp: "${text}". 
               O texto está em Português. 
               Se não houver data, assuma 'hoje'. 
               Se não houver ano, use 2024. 
               Se houver múltiplos serviços, escolha o principal.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clientName: { type: Type.STRING, description: "Nome do cliente" },
          serviceName: { type: Type.STRING, description: "Nome do serviço solicitado" },
          date: { type: Type.STRING, description: "Data no formato YYYY-MM-DD" },
          time: { type: Type.STRING, description: "Horário no formato HH:mm" },
          confidence: { type: Type.NUMBER, description: "Nível de confiança de 0 a 1" }
        },
        required: ["clientName", "serviceName", "date", "time"]
      }
    }
  });

  return JSON.parse(response.text);
}
