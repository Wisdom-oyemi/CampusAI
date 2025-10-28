import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

interface NvidiaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callNvidiaAPI(messages: NvidiaMessage[]): Promise<string> {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
    throw new Error("NVIDIA API returned an invalid response");
  }
  
  return data.choices[0].message.content;
}

function buildCampusContext(events: any[], deadlines: any[], tutoringSessions: any[]): string {
  return `You are a helpful campus AI assistant powered by NVIDIA Nemotron. You have access to the following campus information:

UPCOMING EVENTS:
${events.map(e => `- ${e.title} on ${e.date} at ${e.time} in ${e.location} (${e.category})`).join('\n')}

DEADLINES:
${deadlines.map(d => `- ${d.title} due ${d.dueDate}${d.course ? ` for ${d.course}` : ''}`).join('\n')}

TUTORING SESSIONS:
${tutoringSessions.map(t => `- ${t.subject} with ${t.tutor} at ${t.time} in ${t.location} (${t.availability})`).join('\n')}

When answering questions:
- Be helpful and concise
- Reference specific events, deadlines, or tutoring sessions when relevant
- If asked about something not in the data, politely say you don't have that information
- Format your responses in a clear, readable way`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = z.object({ message: z.string() }).parse(req.body);

      const userMessage = await storage.createChatMessage({
        message,
        isAI: "false",
      });

      const [events, deadlines, tutoringSessions, chatHistory] = await Promise.all([
        storage.getEvents(),
        storage.getDeadlines(),
        storage.getTutoringSessions(),
        storage.getChatMessages(),
      ]);

      const systemPrompt = buildCampusContext(events, deadlines, tutoringSessions);

      const recentHistory = chatHistory
        .slice(-10)
        .filter(msg => msg.id !== userMessage.id)
        .map(msg => ({
          role: msg.isAI === "true" ? "assistant" as const : "user" as const,
          content: msg.message,
        }));

      const aiResponse = await callNvidiaAPI([
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: message },
      ]);

      const aiMessage = await storage.createChatMessage({
        message: aiResponse,
        isAI: "true",
      });

      res.json({
        userMessage,
        aiMessage,
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process chat message" 
      });
    }
  });

  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/deadlines", async (_req, res) => {
    try {
      const deadlines = await storage.getDeadlines();
      res.json(deadlines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tutoring", async (_req, res) => {
    try {
      const sessions = await storage.getTutoringSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/chat/history", async (_req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
