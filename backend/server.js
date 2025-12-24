const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const { analyzeMessage } = require("./gemini");
const { supabase } = require("./supabase");

const app = express();

// 🔹 Segurança e middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" })); // restringir para seu frontend
app.use(express.json());

// 🔹 Porta dinâmica
const PORT = process.env.PORT || 3000;

// 🔹 Rota raiz (teste)
app.get("/", (req, res) => {
  res.send("Backend BellaFlow rodando 🚀");
});

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
  } else {
    console.warn(`⚠️ Tentativa de validação webhook falhou. Mode: ${mode}, Token: ${token}`);
    return res.sendStatus(403);
  }
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

    const phoneNumberId = value.metadata.phone_number_id;
    const from = message.from;
    const text = message.text.body;

    console.log(`📩 [Salão: ${phoneNumberId}] Mensagem de ${from}: ${text}`);

    // 1️⃣ Localizar Salão ou criar
    let { data: salon } = await supabase
      .from("salons")
      .select("*")
      .eq("phone_number_id", phoneNumberId)
      .single();

    if (!salon) {
      const { data: newSalon, error: createError } = await supabase
        .from("salons")
        .upsert({
          phone_number_id: phoneNumberId,
          name: `Salão BellaFlow (${phoneNumberId.slice(-4)})`,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Erro criando salão:", createError.message);
        throw createError;
      }
      salon = newSalon;
    }

    // 2️⃣ Salvar mensagem
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

    // 3️⃣ IA: Analisar agendamento
    const suggestion = await analyzeMessage(text);

    if (suggestion) {
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
      console.log(`✨ Sugestão gerada: ${suggestion.service} para ${suggestion.clientName} em ${suggestion.date} ${suggestion.time}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro Webhook Cloud:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// 🔹 Listen com host correto
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

