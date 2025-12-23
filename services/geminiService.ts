
import { GoogleGenAI, Type } from "@google/genai";

export async function extractAppointmentFromText(text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

export async function suggestSalonBranding(userInput: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `O usuário quer configurar seu salão de beleza. Ele disse: "${userInput}". 
               Crie um nome elegante e profissional para o salão dele. 
               Responda apenas com o JSON contendo o nome sugerido e uma pequena frase de boas vindas.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          salonName: { type: Type.STRING },
          welcomeMessage: { type: Type.STRING }
        },
        required: ["salonName", "welcomeMessage"]
      }
    }
  });

  return JSON.parse(response.text);
}
