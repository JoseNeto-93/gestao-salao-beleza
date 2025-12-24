
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { analyzeMessage } from "./gemini.js";
import { supabase } from "./supabase.js";

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares essenciais
app.use(cors());
app.use(bodyParser.json());

// Configurações de Rede para Render
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Rota raiz para Health Check do Render
app.get("/", (req, res) => {
  res.status(200).send("BellaFlow API: Status OK 🚀");
});

// Status detalhado para o frontend
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

  // Verifica o token configurado no painel da Meta
  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("✅ Webhook Meta validado com sucesso!");
    return res.status(200).send(challenge);
  }
  
  console.warn("⚠️ Falha na validação do Webhook. Token incorreto.");
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

    // Ignorar se não for mensagem de texto
    if (!message || !message.text) return res.sendStatus(200);

    const phoneNumberId = value.metadata.phone_number_id;
    const from = message.from;
    const text = message.text.body;

    console.log(`📩 Mensagem de ${from} [ID: ${phoneNumberId}]: ${text}`);

    // 1. Gerenciar Identidade do Salão (Multi-tenant)
    let { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("*")
      .eq("phone_number_id", phoneNumberId)
      .single();

    if (!salon) {
      const { data: newSalon, error: createError } = await supabase
        .from("salons")
        .insert({
          phone_number_id: phoneNumberId,
          name: `Salão BellaFlow (${phoneNumberId.slice(-4)})`,
          is_active: true
        })
        .select()
        .single();
      
      if (createError) throw createError;
      salon = newSalon;
    }

    // 2. Persistir Mensagem no Banco
    const { data: msgRow, error: msgError } = await supabase
      .from("messages")
      .insert({
        salon_id: salon.id,
        from_number: from,
        text: text,
        source: "whatsapp_cloud"
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // 3. IA: Processamento de Intenção com Gemini
    const suggestion = await analyzeMessage(text);

    if (suggestion) {
      const { error: sugError } = await supabase.from("ai_suggestions").insert({
        salon_id: salon.id,
        message_id: msgRow.id,
        client_name: suggestion.clientName || "Cliente",
        service: suggestion.service || "Serviço pendente",
        date: suggestion.date,
        time: suggestion.time,
        price: suggestion.estimatedPrice,
        status: "pending"
      });
      
      if (!sugError) {
        console.log(`✨ Sugestão Gerada para: ${salon.name}`);
      } else {
        console.error("❌ Erro ao salvar sugestão:", sugError.message);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro crítico no Webhook:", err.message);
    res.sendStatus(500);
  }
});

// Inicialização do Servidor
app.listen(PORT, HOST, () => {
  console.log(`\n================================================`);
  console.log(`🚀 BellaFlow Backend em Produção`);
  console.log(`📡 Host: ${HOST} | Porta: ${PORT}`);
  console.log(`🔗 Webhook: http://${HOST}:${PORT}/webhook`);
  console.log(`================================================\n`);
});
