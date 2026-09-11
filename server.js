import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// A chave permanece SOMENTE no Railway
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Teste do servidor
app.get("/", (req, res) => {
  res.json({
    status: "online",
    agente: "Agente Superpowers IA",
    gemini: !!process.env.GEMINI_API_KEY
  });
});

// Endpoint do agente
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;

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
        error: "O Gemini não retornou texto."
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
});

app.listen(PORT, () => {
  console.log(`🚀 Agente Superpowers rodando na porta ${PORT}`);
});
