import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    agent: "Agente Superpowers",
    gemini: !!process.env.GEMINI_API_KEY
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    gemini: !!process.env.GEMINI_API_KEY
  });
});

app.post("/api/agent", async (req, res) => {
  try {
    const command = req.body?.command;

    if (!command || !command.trim()) {
      return res.status(400).json({
        error: "Nenhum comando foi informado."
      });
    }

    const prompt = `
Você é o Agente Superpowers.

Sua função é ajudar o usuário a executar tarefas,
planejar soluções, escrever código, analisar problemas
e transformar comandos em ações práticas.

Responda em português do Brasil.

Comando recebido:
${command}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt
    });

    res.json({
      success: true,
      command,
      response: response.text
    });

  } catch (error) {
    console.error("Erro Gemini:", error);

    res.status(500).json({
      success: false,
      error: "Não foi possível executar o comando.",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Agente Superpowers rodando na porta ${PORT}`);
});
