# BellaFlow - Gestão de Salões de Beleza (Multi-Tenant)

Sistema moderno de gestão para salões de beleza, com integração WhatsApp + IA (Gemini).

## 🚀 Como Iniciar o Sistema (Windows)

**Maneira Mais Fácil:**
1. Dê um **clique duplo** no arquivo `iniciar_sistema.bat`.
   - Isso abrirá o servidor e o site automaticamente para você.

---

**Maneira Manual (Terminal):**
Se preferir usar o terminal, você precisa de **dois** terminais abertos:

**Terminal 1 (Backend/API):**
```bash
node server.js
```

**Terminal 2 (Frontend/Site):**
```bash
npm run dev
```
(Depois clique no link que aparecer, ex: `http://localhost:5173`)

---

## ⚠️ AVISO IMPORTANTE
**NÃO** use "Live Server" ou abra o `index.html` direto. O sistema não vai funcionar e dará erro de "MIME type".
Use sempre o `iniciar_sistema.bat` ou `npm run dev`.

## Detalhes do Projeto
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Banco de Dados**: Supabase (Mock Mode ativado se sem chaves)
- **IA**: Google Gemini
