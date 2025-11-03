import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import * as cheerio from "cheerio";

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

// Extract URLs from a message using a simple regex
function extractURLs(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  return matches || [];
}

// Fetch and extract text content from a webpage
async function fetchWebPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CampusAIBot/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      return `[Failed to fetch ${url}: HTTP ${response.status}]`;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, and other non-content elements
    $('script, style, nav, footer, iframe, noscript').remove();

    // Extract text from body
    const text = $('body').text()
      .replace(/\s+/g, ' ') // collapse whitespace
      .trim()
      .slice(0, 8000); // limit to ~8000 chars to avoid token limits

    return text || '[No readable content found]';
  } catch (error: any) {
    return `[Error fetching ${url}: ${error.message}]`;
  }
}

// University events URL mapping - fallback for known universities
const UNIVERSITY_EVENTS_MAP: Record<string, string[]> = {
  'howard': ['https://www2.howard.edu/events'],
  'georgetown': ['https://events.georgetown.edu/'],
  'american': ['https://www.american.edu/events/'],
  'gw': ['https://events.gwu.edu/'],
  'george washington': ['https://events.gwu.edu/'],
  'umd': ['https://www.umd.edu/events'],
  'maryland': ['https://www.umd.edu/events'],
  'mit': ['https://events.mit.edu/'],
  'harvard': ['https://www.harvard.edu/events/'],
  'stanford': ['https://events.stanford.edu/'],
  'berkeley': ['https://events.berkeley.edu/'],
  'nyu': ['https://www.nyu.edu/community/events.html'],
};

// Extract university name from message using common patterns
function extractUniversityName(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Patterns to extract just the university name
  const patterns = [
    // "at Yale University" or "from Harvard University" or "in Cornell University"
    /(?:at|from|in|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:university|college|institute)/i,
    // "Yale University events" or "Stanford University calendar"
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:university|college|institute)(?:\s+(?:events?|calendar|activities|schedule))?/i,
    // "events at Yale" or "calendar for Duke"
    /(?:events?|calendar|activities|schedule)\s+(?:at|for|from|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i,
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Filter out common non-university words (case-insensitive check)
      const stopWords = ['the', 'a', 'an', 'my', 'our', 'this', 'that', 'events', 'are', 'is', 'what', 'when', 'where', 'any', 'some', 'for', 'at', 'in', 'from'];
      if (!stopWords.includes(name.toLowerCase()) && name.length > 2) {
        console.log(`[extractUniversityName] Matched pattern and extracted: "${name}"`);
        return name;
      }
    }
  }
  
  console.log(`[extractUniversityName] No university name found in: "${message}"`);
  return null;
}

// Generate common university event URL patterns
function generateUniversityEventURLs(universityName: string): string[] {
  // Remove common words and clean up
  const cleanName = universityName
    .toLowerCase()
    .replace(/\buniversity\b|\bcollege\b|\binstitute\b|\bof\b|\bthe\b/gi, '')
    .trim()
    .replace(/\s+/g, '');
  
  console.log(`[generateUniversityEventURLs] Clean name: "${cleanName}" from "${universityName}"`);
  
  // Generate common URL patterns for different domains and structures
  const urls = [
    // US .edu domains
    `https://www.${cleanName}.edu/events`,
    `https://${cleanName}.edu/events`,
    `https://events.${cleanName}.edu/`,
    `https://www.${cleanName}.edu/calendar`,
    `https://calendar.${cleanName}.edu/`,
    
    // Alternative paths
    `https://www.${cleanName}.edu/student-life/events`,
    `https://www.${cleanName}.edu/campus-life/events`,
    
    // International domains (.ac.uk, .edu.au, .ca, etc.)
    `https://www.${cleanName}.ac.uk/events`,
    `https://www.${cleanName}.edu.au/events`,
    `https://www.${cleanName}.ca/events`,
    
    // Generic .com/.org for some universities
    `https://www.${cleanName}.com/events`,
    `https://www.${cleanName}.org/events`,
  ];
  
  console.log(`[generateUniversityEventURLs] Generated ${urls.length} URLs`);
  return urls;
}

// Generate professor lookup URLs for a university
function generateProfessorURLs(universityName: string, professorName?: string, department?: string): string[] {
  const cleanUnivName = universityName
    .toLowerCase()
    .replace(/\buniversity\b|\bcollege\b|\binstitute\b|\bof\b|\bthe\b/gi, '')
    .trim()
    .replace(/\s+/g, '');
  
  const urls: string[] = [];
  
  if (professorName) {
    // If professor name is provided, search for specific professor
    const cleanProfName = professorName.toLowerCase().replace(/\s+/g, '+');
    urls.push(
      `https://www.${cleanUnivName}.edu/directory?q=${cleanProfName}`,
      `https://${cleanUnivName}.edu/people?search=${cleanProfName}`,
      `https://www.${cleanUnivName}.edu/faculty/${cleanProfName.replace(/\+/g, '-')}`,
      `https://directory.${cleanUnivName}.edu/?q=${cleanProfName}`,
    );
  } else if (department) {
    // If department is specified (e.g., "computer science"), search department faculty
    const cleanDept = department.toLowerCase().replace(/\s+/g, '-');
    const deptShort = department.toLowerCase().replace(/\s+/g, '');
    urls.push(
      `https://www.${cleanUnivName}.edu/${cleanDept}/faculty`,
      `https://www.${cleanUnivName}.edu/${cleanDept}/people`,
      `https://www.${cleanUnivName}.edu/academics/${cleanDept}/faculty`,
      `https://${deptShort}.${cleanUnivName}.edu/faculty`,
      `https://${deptShort}.${cleanUnivName}.edu/people`,
      `https://www.${cleanUnivName}.edu/${cleanDept}/directory`,
    );
  } else {
    // General faculty directory URLs
    urls.push(
      `https://www.${cleanUnivName}.edu/faculty`,
      `https://${cleanUnivName}.edu/directory`,
      `https://www.${cleanUnivName}.edu/people/faculty`,
      `https://directory.${cleanUnivName}.edu/`,
      `https://www.${cleanUnivName}.edu/academics/faculty`,
    );
  }
  
  console.log(`[generateProfessorURLs] Generated ${urls.length} professor URLs`);
  return urls;
}

// Extract professor name from message
function extractProfessorName(message: string): string | null {
  const patterns = [
    /professor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /prof\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:find|lookup|search|about)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:professor|prof|faculty|at)/i,
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      const stopWords = ['for', 'at', 'in', 'the', 'from', 'computer', 'science'];
      if (!stopWords.includes(name.toLowerCase().split(/\s+/)[0]) && name.length > 2) {
        console.log(`[extractProfessorName] Extracted professor: "${name}"`);
        return name;
      }
    }
  }
  
  return null;
}

// Extract department name from message
function extractDepartment(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Common department patterns
  const patterns = [
    /(?:in|from|for|at)\s+(?:the\s+)?([a-z\s]+?)\s+(?:department|faculty|professors?|staff)/i,
    /([a-z\s]+?)\s+(?:department|faculty)\s+(?:professors?|staff|faculty|people)/i,
    /(?:professors?|faculty|staff)\s+(?:in|from|for)\s+(?:the\s+)?([a-z\s]+?)(?:\s+at|\s+university|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const dept = match[1].trim();
      const stopWords = ['the', 'a', 'an', 'for', 'at', 'in'];
      const cleanDept = dept.split(/\s+/).filter(word => !stopWords.includes(word.toLowerCase())).join(' ');
      
      if (cleanDept.length > 2) {
        console.log(`[extractDepartment] Extracted department: "${cleanDept}"`);
        return cleanDept;
      }
    }
  }
  
  return null;
}

// Detect professor lookup queries and return relevant URLs
function getProfessorURLs(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const urls: string[] = [];
  
  console.log(`[getProfessorURLs] Processing message: "${message}"`);
  
  // Check if asking about professors/faculty
  const professorKeywords = ['professor', 'prof', 'faculty', 'instructor', 'teacher', 'staff', 'office hours', 'contact'];
  const isAskingAboutProfessor = professorKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (!isAskingAboutProfessor) {
    return [];
  }
  
  console.log(`[getProfessorURLs] Detected professor query`);
  
  // Extract university, professor, and department names
  const universityName = extractUniversityName(message);
  const professorName = extractProfessorName(message);
  const department = extractDepartment(message);
  
  if (universityName) {
    console.log(`[getProfessorURLs] University: "${universityName}", Professor: "${professorName || 'none'}", Department: "${department || 'none'}"`);
    const generatedURLs = generateProfessorURLs(universityName, professorName || undefined, department || undefined);
    urls.push(...generatedURLs.slice(0, 4)); // Try first 4 patterns
  }
  
  console.log(`[getProfessorURLs] Final professor URLs:`, urls);
  return urls;
}

// Detect university mentions and return their events URLs (dynamic + hardcoded)
function getUniversityURLs(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const urls: string[] = [];
  
  console.log(`[getUniversityURLs] Processing message: "${message}"`);
  
  // Check if the message is asking about events/calendar/activities
  const eventKeywords = ['event', 'calendar', 'happening', 'activities', 'schedule'];
  const isAskingAboutEvents = eventKeywords.some(keyword => lowerMessage.includes(keyword));
  
  console.log(`[getUniversityURLs] Is asking about events: ${isAskingAboutEvents}`);
  
  if (!isAskingAboutEvents) {
    return [];
  }
  
  // First, check hardcoded map for known universities
  let foundInMap = false;
  for (const [universityName, eventURLs] of Object.entries(UNIVERSITY_EVENTS_MAP)) {
    if (lowerMessage.includes(universityName)) {
      console.log(`[getUniversityURLs] Detected query about ${universityName} (from map)`);
      urls.push(...eventURLs);
      foundInMap = true;
    }
  }
  
  // If not in map, try to extract university name and generate URLs
  if (!foundInMap) {
    const extractedName = extractUniversityName(message);
    if (extractedName) {
      console.log(`[getUniversityURLs] Detected university: "${extractedName}" (dynamic). Generating event URLs...`);
      const generatedURLs = generateUniversityEventURLs(extractedName);
      // Try first 4 patterns - prioritize .edu domains
      urls.push(...generatedURLs.slice(0, 4));
      console.log(`[getUniversityURLs] Added ${generatedURLs.slice(0, 4).length} URLs to fetch`);
    } else {
      console.log(`[getUniversityURLs] No university name extracted`);
    }
  }
  
  console.log(`[getUniversityURLs] Final URLs to fetch:`, urls);
  return urls;
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
- Reference specific events, deadlines, tutoring sessions, or web content when relevant
- When web page content is provided, carefully extract and present the information
- For professor/faculty queries: Look through the web content and extract ALL professor names, titles, emails, departments, and research areas mentioned
- If the web content contains a faculty list or directory, present it in a clear, organized format with names and key details
- For department faculty queries, list as many professors as you can find from the web content
- If asked about something not in the data or web content, politely say you don't have that information and suggest checking the university's official website
- Format your responses in a clear, readable way with proper headings, bullet points, and sections`;
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

      // Check if the user message contains URLs and fetch their content
      let urls = extractURLs(message);
      
      // Check if user is asking about university events
      const universityURLs = getUniversityURLs(message);
      if (universityURLs.length > 0) {
        urls = [...urls, ...universityURLs];
      }
      
      // Check if user is asking about professors/faculty
      const professorURLs = getProfessorURLs(message);
      if (professorURLs.length > 0) {
        urls = [...urls, ...professorURLs];
      }
      
      let webContent = '';
      if (urls.length > 0) {
        console.log(`Fetching content from ${urls.length} URL(s)...`);
        const contentPromises = urls.slice(0, 4).map(url => fetchWebPageContent(url)); // limit to 4 URLs
        const contents = await Promise.all(contentPromises);
        webContent = urls.slice(0, 4).map((url, i) => 
          `\n\nWEB PAGE CONTENT FROM ${url}:\n${contents[i]}`
        ).join('\n');
      }

      const systemPrompt = buildCampusContext(events, deadlines, tutoringSessions) + webContent;

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
