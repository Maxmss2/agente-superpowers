import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// A chave do Gemini fica SOMENTE no Railway.
// NÃO coloque a chave neste código.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    status: "online",
    agente: "Agente Superpowers IA",
    gemini: !!process.env.GEMINI_API_KEY
  });
});

// Função principal do agente
async function executarAgente(req, res) {
  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        success: false,
        error: "Nenhum comando foi enviado."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "GEMINI_API_KEY não está configurada no Railway."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const text = response.text;

    if (!text) {
      return res.status(500).json({
        success: false,
        error: "O Gemini não retornou uma resposta."
      });
    }

    return res.json({
      success: true,
      response: text
    });

  } catch (error) {
    console.error("ERRO GEMINI:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Erro desconhecido ao comunicar com o Gemini."
    });
  }
}

// Aceita as DUAS rotas para evitar erro de comunicação
app.post("/api/chat", executarAgente);
app.post("/api/gemini", executarAgente);

app.listen(PORT, () => {
  console.log(`🚀 Agente Superpowers rodando na porta ${PORT}`);
});
