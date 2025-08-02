import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { generateChatResponse, generateConversationTitle } from "./services/openai";
import { searchKnowledgeBase } from "./services/knowledge-base";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat conversation routes
  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversationId(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Chat message endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      let currentConversationId = conversationId;

      // Create new conversation if none provided
      if (!currentConversationId) {
        const title = await generateConversationTitle(message);
        const conversation = await storage.createConversation({
          userId: null, // Anonymous for now
          title,
        });
        currentConversationId = conversation.id;
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: currentConversationId,
        role: "user",
        content: message,
      });

      // Get conversation history for context
      const recentMessages = await storage.getRecentMessages(currentConversationId, 8);
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Generate AI response
      const aiResponse = await generateChatResponse(message, conversationHistory);

      // Save AI message
      const assistantMessage = await storage.createMessage({
        conversationId: currentConversationId,
        role: "assistant",
        content: aiResponse.message,
        metadata: {
          suggestions: aiResponse.suggestions,
          resources: aiResponse.resources,
        },
      });

      res.json({
        conversationId: currentConversationId,
        userMessage,
        assistantMessage,
        response: aiResponse,
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        message: "I'm having trouble connecting right now. Please try again or browse the resources section for immediate help." 
      });
    }
  });

  // Search knowledge base
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const results = searchKnowledgeBase(q, 10);
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search service temporarily unavailable" });
    }
  });

  // Quick actions endpoint
  app.post("/api/quick-action", async (req, res) => {
    try {
      const { action } = req.body;
      
      let message = '';
      switch(action) {
        case 'curriculum':
          message = 'Tell me about the CHM curriculum structure and phases';
          break;
        case 'schedules':
          message = 'Show me class schedules and important academic dates';
          break;
        case 'resources':
          message = 'What learning resources are available for medical students?';
          break;
        case 'help':
          message = 'I need help navigating the JustInTimeMedicine website';
          break;
        default:
          return res.status(400).json({ message: "Invalid quick action" });
      }

      // Process as regular chat message
      const aiResponse = await generateChatResponse(message);
      
      res.json({
        message,
        response: aiResponse,
      });
    } catch (error) {
      console.error("Quick action error:", error);
      res.status(500).json({ message: "Quick action service temporarily unavailable" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
