
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { analyzeMessage } from "./gemini.js";
import { supabase } from "./supabase.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔎 STATUS (Monitoramento pelo Frontend)
app.get("/status", (req, res) => {
  res.json({ 
    status: "CONNECTED",
    mode: "Cloud API",
    tenancy: "Multi-Tenant Active"
  });
});

/**
 * ✅ WEBHOOK VERIFICAÇÃO (GET)
 * Usado pela Meta para validar seu servidor.
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("✅ Webhook BellaFlow validado com sucesso!");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/**
 * 📩 WEBHOOK MENSAGENS (POST)
 * Processa mensagens de qualquer salão conectado via Cloud API.
 */
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // Ignorar se não houver mensagem de texto
    if (!message || !message.text) return res.sendStatus(200);

    const phoneNumberId = value.metadata.phone_number_id; // Identificador único do salão
    const from = message.from; // Número da cliente
    const text = message.text.body;

    console.log(`📩 [Salão: ${phoneNumberId}] Mensagem de ${from}: ${text}`);

    // 1. Localizar Salão (ou criar novo salão se for o primeiro acesso)
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

    // 2. Salvar mensagem no histórico do salão
    const { data: msgRow, error: msgError } = await supabase
      .from("messages")
      .insert({
        salon_id: salon.id,
        from_number: from,
        text,
        source: "whatsapp_cloud"
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // 3. IA: Analisar se existe uma intenção de agendamento/venda
    const suggestion = await analyzeMessage(text);

    if (suggestion) {
      // 4. Salvar como sugestão pendente para o usuário confirmar no sistema
      await supabase.from("ai_suggestions").insert({
        salon_id: salon.id,
        message_id: msgRow.id,
        client_name: suggestion.clientName || "Cliente",
        service: suggestion.service || "Não identificado",
        date: suggestion.date,
        time: suggestion.time,
        price: suggestion.estimatedPrice,
        status: "pending"
      });
      console.log(`✨ Sugestão gerada para o salão ${salon.id}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro Webhook Cloud:", err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n================================================`);
  console.log(`🚀 BellaFlow Multi-Tenant Cloud API Online`);
  console.log(`📡 Porta: ${PORT}`);
  console.log(`✅ Webhook: http://localhost:${PORT}/webhook`);
  console.log(`================================================\n`);
});
