import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// A chave fica somente no ambiente do servidor.
// NUNCA coloque a chave diretamente neste arquivo.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Teste básico do servidor
app.get("/", (req, res) => {
  res.json({
    status: "online",
    agent: "Agente Superpowers",
    gemini: !!process.env.GEMINI_API_KEY
  });
});

// Verificação de saúde
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    gemini: !!process.env.GEMINI_API_KEY
  });
});

// Endpoint principal do Agente Superpowers
app.post("/api/agent", async (req, res) => {
  try {
    const command = req.body?.command;

    if (!command || !command.trim()) {
      return res.status(400).json({
        success: false,
        error: "Nenhum comando foi informado."
      });
    }

    const prompt = `
Você é o Agente Superpowers, um assistente de inteligência
artificial criado para ajudar o usuário a transformar ideias
em ações práticas.

Sua função é:

- analisar problemas;
- criar soluções;
- escrever e revisar código;
- explicar assuntos de forma simples;
- criar planos passo a passo;
- ajudar em projetos;
- organizar informações;
- sugerir automações;
- executar raciocínio antes de responder.

Responda sempre em português do Brasil.

Se o usuário pedir código, forneça código completo quando
isso for mais útil.

Se a tarefa tiver várias etapas, organize a resposta em
passos claros.

Comando do usuário:

${command}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    res.json({
      success: true,
      command: command,
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
  console.log(
    `Agente Superpowers rodando na porta ${PORT}`
  );
});
