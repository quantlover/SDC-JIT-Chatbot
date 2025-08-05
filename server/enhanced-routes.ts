import type { Express } from "express";
import { createServer, type Server } from "http";
import { enhancedStorage } from "./enhanced-storage";
import { z } from "zod";
import { 
  insertConversationSchema, 
  insertMessageSchema, 
  insertReactionSchema,
  insertBookmarkSchema,
  insertAnalyticsSchema 
} from "@shared/schema";
import { upload, processUploadedFile } from "./services/file-upload";
import { transcribeAudio, synthesizeVoice, processVoiceMessage, isAudioFile } from "./services/voice-processing";
import express from "express";
import path from "path";
import OpenAI from "openai";

// Enhanced chat completion with medical knowledge base
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "demo_key"
});

// Medical knowledge base for CHM
const medicalKnowledgeBase = {
  learningSocieties: {
    "Jane Addams": "Values-based learning focusing on social justice, community health, and healthcare advocacy.",
    "John Dewey": "Problem-based learning emphasizing critical thinking and experiential education.",
    "Abraham Flexner": "Evidence-based learning grounded in scientific rigor and research methodology.",
    "William Osler": "Patient-centered learning emphasizing bedside manner and clinical skills."
  },
  academicPhases: {
    "M1": "First year focusing on foundational sciences, anatomy, physiology, and basic clinical skills.",
    "MCE": "Medical Care Experience - clinical rotations in various specialties with patient care responsibilities.",
    "LCE": "Longitudinal Care Experience - advanced clinical training with continuity of care focus."
  },
  resources: {
    "Canvas": "Learning management system for coursework, assignments, and academic resources.",
    "MyMSU": "Student portal for registration, grades, and university services.",
    "LCME": "Liaison Committee on Medical Education standards and accreditation information.",
    "NBME": "National Board of Medical Examiners practice exams and assessment tools.",
    "Clinical Skills Center": "Simulation lab for practicing clinical procedures and patient interactions."
  }
};

async function generateEnhancedChatResponse(message: string, conversationHistory: any[] = []): Promise<string> {
  const systemPrompt = `You are the Just In Time Medicine AI assistant for the College of Human Medicine at Michigan State University. You help medical students navigate their Shared Discovery Curriculum, learning societies, and academic resources.

Learning Societies:
- Jane Addams: ${medicalKnowledgeBase.learningSocieties["Jane Addams"]}
- John Dewey: ${medicalKnowledgeBase.learningSocieties["John Dewey"]}
- Abraham Flexner: ${medicalKnowledgeBase.learningSocieties["Abraham Flexner"]}
- William Osler: ${medicalKnowledgeBase.learningSocieties["William Osler"]}

Academic Phases:
- M1: ${medicalKnowledgeBase.academicPhases["M1"]}
- MCE: ${medicalKnowledgeBase.academicPhases["MCE"]}
- LCE: ${medicalKnowledgeBase.academicPhases["LCE"]}

Key Resources: Canvas, MyMSU, LCME standards, NBME practice exams, Clinical Skills Center

Always provide helpful, accurate information about CHM curriculum, learning opportunities, and student support resources. Be encouraging and supportive while maintaining professionalism.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "I apologize, but I'm having trouble generating a response right now. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Enhanced fallback responses based on keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('learning society') || lowerMessage.includes('societies')) {
      return `CHM has four learning societies, each with a unique educational philosophy:

• **Jane Addams Society**: Focuses on social justice and community health advocacy
• **John Dewey Society**: Emphasizes problem-based learning and critical thinking  
• **Abraham Flexner Society**: Grounds learning in scientific rigor and research
• **William Osler Society**: Centers on patient care and clinical excellence

Each society provides mentorship, community, and specialized learning opportunities. Would you like to know more about any specific society?`;
    }
    
    if (lowerMessage.includes('m1') || lowerMessage.includes('first year')) {
      return `The M1 year focuses on foundational medical sciences including:

• Anatomy and physiology
• Biochemistry and molecular biology
• Pathology fundamentals
• Basic clinical skills
• Professional development

Students also begin their learning society activities and community engagement projects. The curriculum integrates basic sciences with early clinical exposure to build a strong foundation for your medical career.`;
    }
    
    if (lowerMessage.includes('mce') || lowerMessage.includes('clinical rotations')) {
      return `The Medical Care Experience (MCE) involves clinical rotations across various specialties:

• Internal Medicine
• Surgery  
• Pediatrics
• Psychiatry
• Obstetrics & Gynecology
• Family Medicine
• Emergency Medicine

During MCE, you'll work directly with patients under supervision, apply your foundational knowledge, and explore different medical specialties to inform your career path.`;
    }
    
    if (lowerMessage.includes('canvas') || lowerMessage.includes('learning management')) {
      return `Canvas is CHM's learning management system where you can:

• Access course materials and assignments
• Submit coursework and view grades
• Participate in discussion forums
• Access recorded lectures and resources
• Connect with classmates and faculty

Log in through MyMSU or directly at canvas.msu.edu with your MSU credentials.`;
    }
    
    return `I'm here to help with information about CHM's curriculum, learning societies, and student resources. I can assist with questions about:

• Learning societies (Jane Addams, John Dewey, Abraham Flexner, William Osler)
• Academic phases (M1, MCE, LCE) 
• Course resources and platforms
• Student support services
• Clinical experiences and opportunities

What would you like to know more about?`;
  }
}

export async function registerEnhancedRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // User Management Routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await enhancedStorage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:id/preferences", async (req, res) => {
    try {
      const user = await enhancedStorage.updateUserPreferences(req.params.id, req.body.preferences);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced Conversation Routes
  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await enhancedStorage.createConversation(conversationData);
      
      // Track analytics
      await enhancedStorage.trackEvent({
        eventType: 'conversation_created',
        userId: conversationData.userId,
        data: { conversationId: conversation.id }
      });
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await enhancedStorage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/conversations", async (req, res) => {
    try {
      const conversations = await enhancedStorage.getConversationsByUserId(req.params.userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await enhancedStorage.getMessagesByConversationId(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const deleted = await enhancedStorage.deleteConversation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced Chat Route with File and Voice Support
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId, fileAttachments = [], messageType = 'chat' } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      let currentConversationId = conversationId;

      // Create new conversation if none provided
      if (!currentConversationId) {
        const conversation = await enhancedStorage.createConversation({
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          userId: req.body.userId || 'anonymous'
        });
        currentConversationId = conversation.id;
      }

      // Store user message
      const userMessage = await enhancedStorage.createMessage({
        conversationId: currentConversationId,
        role: 'user',
        content: message,
        messageType,
        fileAttachments,
      });

      // Get conversation history for context
      const recentMessages = await enhancedStorage.getRecentMessages(currentConversationId, 10);
      const conversationHistory = recentMessages
        .reverse()
        .slice(0, -1) // Exclude the message we just added
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Generate AI response
      const startTime = Date.now();
      const aiResponse = await generateEnhancedChatResponse(message, conversationHistory);
      const responseTime = Date.now() - startTime;

      // Store AI response
      const assistantMessage = await enhancedStorage.createMessage({
        conversationId: currentConversationId,
        role: 'assistant',
        content: aiResponse,
        responseTime,
        tokenCount: Math.ceil(aiResponse.length / 4), // Rough estimate
      });

      // Track analytics
      await enhancedStorage.trackEvent({
        eventType: 'chat_message',
        userId: req.body.userId,
        data: { 
          conversationId: currentConversationId,
          messageLength: message.length,
          responseTime,
          messageType
        }
      });

      res.json({
        conversation: { id: currentConversationId },
        userMessage,
        assistantMessage,
      });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File Upload Routes
  app.post("/api/upload", upload.array('files', 5), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadResults = [];
      for (const file of req.files as Express.Multer.File[]) {
        const result = await processUploadedFile(file);
        uploadResults.push(result);
      }

      // Track analytics
      await enhancedStorage.trackEvent({
        eventType: 'file_upload',
        userId: req.body.userId,
        data: { 
          fileCount: uploadResults.length,
          totalSize: uploadResults.reduce((sum, file) => sum + file.size, 0)
        }
      });

      res.json(uploadResults);
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Voice Processing Routes
  app.post("/api/voice/transcribe", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      if (!isAudioFile(req.file.mimetype)) {
        return res.status(400).json({ message: "Invalid file type. Only audio files are allowed." });
      }

      const result = await processVoiceMessage(req.file.path);
      
      // Track analytics
      await enhancedStorage.trackEvent({
        eventType: 'voice_transcription',
        userId: req.body.userId,
        data: { 
          duration: result.metadata.originalDuration,
          wordCount: result.metadata.wordCount
        }
      });

      res.json(result);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ message: "Voice transcription failed" });
    }
  });

  app.post("/api/voice/synthesize", async (req, res) => {
    try {
      const { text, voice = 'alloy' } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required" });
      }

      const result = await synthesizeVoice(text, voice);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': result.audioBuffer.length,
      });
      
      res.send(result.audioBuffer);
    } catch (error) {
      console.error("Error synthesizing voice:", error);
      res.status(500).json({ message: "Voice synthesis failed" });
    }
  });

  // Reaction System Routes
  app.post("/api/reactions", async (req, res) => {
    try {
      const reactionData = insertReactionSchema.parse(req.body);
      const reaction = await enhancedStorage.addReaction(reactionData);
      
      await enhancedStorage.trackEvent({
        eventType: 'message_reaction',
        userId: reactionData.userId,
        data: { 
          messageId: reactionData.messageId,
          reactionType: reactionData.reactionType
        }
      });
      
      res.json(reaction);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(400).json({ message: "Invalid reaction data" });
    }
  });

  app.get("/api/reactions/:messageId", async (req, res) => {
    try {
      const reactions = await enhancedStorage.getMessageReactions(req.params.messageId);
      res.json(reactions);
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reactions/:messageId/user/:userId", async (req, res) => {
    try {
      const reaction = await enhancedStorage.getUserReaction(req.params.messageId, req.params.userId);
      res.json(reaction);
    } catch (error) {
      console.error("Error fetching user reaction:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/reactions/:messageId/:userId", async (req, res) => {
    try {
      const removed = await enhancedStorage.removeReaction(req.params.messageId, req.params.userId);
      if (!removed) {
        return res.status(404).json({ message: "Reaction not found" });
      }
      res.json({ message: "Reaction removed successfully" });
    } catch (error) {
      console.error("Error removing reaction:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bookmark System Routes
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse(req.body);
      const bookmark = await enhancedStorage.addBookmark(bookmarkData);
      
      await enhancedStorage.trackEvent({
        eventType: 'bookmark_created',
        userId: bookmarkData.userId,
        data: { 
          messageId: bookmarkData.messageId,
          conversationId: bookmarkData.conversationId
        }
      });
      
      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(400).json({ message: "Invalid bookmark data" });
    }
  });

  app.get("/api/users/:userId/bookmarks", async (req, res) => {
    try {
      const bookmarks = await enhancedStorage.getUserBookmarks(req.params.userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/bookmarks/:id", async (req, res) => {
    try {
      const deleted = await enhancedStorage.removeBookmark(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      res.json({ message: "Bookmark deleted successfully" });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Knowledge Base Routes
  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const items = await enhancedStorage.getKnowledgeBaseItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/knowledge-base/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const items = await enhancedStorage.searchKnowledgeBase(q);
      
      await enhancedStorage.trackSearchQuery(
        req.query.userId as string,
        q,
        items.length,
        items.length > 0
      );
      
      res.json(items);
    } catch (error) {
      console.error("Error searching knowledge base:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics Routes
  app.get("/api/analytics/user/:userId", async (req, res) => {
    try {
      const analytics = await enhancedStorage.getUserAnalytics(req.params.userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/analytics/popular-queries", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const queries = await enhancedStorage.getPopularQueries(limit);
      res.json(queries);
    } catch (error) {
      console.error("Error fetching popular queries:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Search and Suggestions Routes
  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }

      const suggestions = await enhancedStorage.getSearchSuggestions(q);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // System Settings Routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await enhancedStorage.getAllSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { value, description } = req.body;
      const setting = await enhancedStorage.setSystemSetting(
        req.params.key,
        value,
        description,
        req.body.updatedBy
      );
      res.json(setting);
    } catch (error) {
      console.error("Error updating system setting:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}