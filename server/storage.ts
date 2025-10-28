import { 
  type ChatMessage, 
  type InsertChatMessage,
  type Event,
  type InsertEvent,
  type Deadline,
  type InsertDeadline,
  type TutoringSession,
  type InsertTutoringSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  getDeadlines(): Promise<Deadline[]>;
  createDeadline(deadline: InsertDeadline): Promise<Deadline>;
  
  getTutoringSessions(): Promise<TutoringSession[]>;
  createTutoringSession(session: InsertTutoringSession): Promise<TutoringSession>;
}

export class MemStorage implements IStorage {
  private chatMessages: Map<string, ChatMessage>;
  private events: Map<string, Event>;
  private deadlines: Map<string, Deadline>;
  private tutoringSessions: Map<string, TutoringSession>;

  constructor() {
    this.chatMessages = new Map();
    this.events = new Map();
    this.deadlines = new Map();
    this.tutoringSessions = new Map();
    
    this.seedInitialData();
  }

  private seedInitialData() {
    const mockEvents: Event[] = [
      {
        id: randomUUID(),
        title: "AI Workshop: Building Campus Apps",
        date: "Oct 30, 2025",
        time: "2:00 PM - 4:00 PM",
        location: "Engineering Building, Room 205",
        category: "Academic",
        description: "Learn how to build AI-powered applications for campus use."
      },
      {
        id: randomUUID(),
        title: "Career Fair 2025",
        date: "Nov 5, 2025",
        time: "10:00 AM - 4:00 PM",
        location: "Student Center, Main Hall",
        category: "Career",
        description: "Meet with top employers and explore internship opportunities."
      },
      {
        id: randomUUID(),
        title: "Fall Concert Series",
        date: "Nov 8, 2025",
        time: "7:00 PM - 9:00 PM",
        location: "Performing Arts Center",
        category: "Arts",
        description: null as string | null
      }
    ];

    const mockDeadlines: Deadline[] = [
      {
        id: randomUUID(),
        title: "Project Proposal Submission",
        dueDate: "Oct 28, 2025 11:59 PM",
        course: "CS 401: Senior Capstone",
        urgency: "today",
        description: "Submit your final project proposal."
      },
      {
        id: randomUUID(),
        title: "Midterm Exam",
        dueDate: "Nov 2, 2025 2:00 PM",
        course: "MATH 301: Linear Algebra",
        urgency: "thisWeek",
        description: null as string | null
      }
    ];

    const mockTutoring: TutoringSession[] = [
      {
        id: randomUUID(),
        tutor: "Dr. Sarah Johnson",
        subject: "Calculus I & II",
        time: "Today, 2:00 PM - 4:00 PM",
        location: "Building A, Room 305",
        availability: "Available"
      },
      {
        id: randomUUID(),
        tutor: "Prof. Michael Chen",
        subject: "Computer Science",
        time: "Tomorrow, 3:00 PM - 5:00 PM",
        location: "CS Lab, Room 120",
        availability: "Limited"
      }
    ];

    mockEvents.forEach(event => this.events.set(event.id, event));
    mockDeadlines.forEach(deadline => this.deadlines.set(deadline.id, deadline));
    mockTutoring.forEach(session => this.tutoringSessions.set(session.id, session));
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent, 
      id,
      description: insertEvent.description ?? null
    };
    this.events.set(id, event);
    return event;
  }

  async getDeadlines(): Promise<Deadline[]> {
    return Array.from(this.deadlines.values());
  }

  async createDeadline(insertDeadline: InsertDeadline): Promise<Deadline> {
    const id = randomUUID();
    const deadline: Deadline = { 
      ...insertDeadline, 
      id,
      course: insertDeadline.course ?? null,
      description: insertDeadline.description ?? null
    };
    this.deadlines.set(id, deadline);
    return deadline;
  }

  async getTutoringSessions(): Promise<TutoringSession[]> {
    return Array.from(this.tutoringSessions.values());
  }

  async createTutoringSession(insertSession: InsertTutoringSession): Promise<TutoringSession> {
    const id = randomUUID();
    const session: TutoringSession = { ...insertSession, id };
    this.tutoringSessions.set(id, session);
    return session;
  }
}

export const storage = new MemStorage();
