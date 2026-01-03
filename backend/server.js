import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { analyzeMessage } from "./gemini.js";
import { supabase } from "./supabase.js";

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares essenciais para SaaS Cloud
app.use(cors({
  origin: "*", // Permite qualquer origem para o demo, ajuste em produção
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());

// Configurações de Rede - Essencial para Render/Heroku
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // IMPORTANTE: Deve ser 0.0.0.0 no Render

// Rota raiz para Health Check e Redirecionamento amigável
app.get("/", (req, res) => {
  res.status(200).send("BellaFlow API: Operacional 🚀");
});

// Status para o dashboard do frontend
app.get("/status", (req, res) => {
  res.json({ 
    status: "CONNECTED",
    mode: "Cloud API",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

/**
 * Webhook de Validação da Meta (GET)
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("✅ Webhook Meta validado com sucesso!");
    return res.status(200).send(challenge);
  }
  
  return res.sendStatus(403);
});

/**
 * Webhook de Mensagens (POST)
 */
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message || !message.text) return res.sendStatus(200);

    const phoneNumberId = value.metadata.phone_number_id;
    const from = message.from;
    const text = message.text.body;

    console.log(`📩 Mensagem recebida [Salon ID: ${phoneNumberId}]`);

    let { data: salon } = await supabase
      .from("salons")
      .select("*")
      .eq("phone_number_id", phoneNumberId)
      .single();

    if (!salon) {
      const { data: newSalon } = await supabase
        .from("salons")
        .insert({
          phone_number_id: phoneNumberId,
          name: `Salão BellaFlow (${phoneNumberId.slice(-4)})`,
          is_active: true
        })
        .select()
        .single();
      salon = newSalon;
    }

    if (salon) {
      const { data: msgRow } = await supabase
        .from("messages")
        .insert({
          salon_id: salon.id,
          from_number: from,
          text: text,
          source: "whatsapp_cloud"
        })
        .select()
        .single();

      const suggestion = await analyzeMessage(text);

      if (suggestion && msgRow) {
        await supabase.from("ai_suggestions").insert({
          salon_id: salon.id,
          message_id: msgRow.id,
          client_name: suggestion.clientName || "Cliente",
          service: suggestion.service || "Serviço pendente",
          date: suggestion.date,
          time: suggestion.time,
          price: suggestion.estimatedPrice,
          status: "pending"
        });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro Webhook:", err.message);
    res.sendStatus(500);
  }
});

// Inicialização explicativa
app.listen(PORT, HOST, () => {
  console.log(`🚀 BellaFlow Backend: http://${HOST}:${PORT}`);
});