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
import { MedicalKnowledgeBase } from "./knowledge-base";
import { EnhancedKnowledgeBase } from "./enhanced-knowledge-base";
import { testGenerator } from "./curriculum-testing";

// Enhanced chat completion with medical knowledge base
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "demo_key"
});

// Initialize both knowledge bases
const knowledgeBase = new MedicalKnowledgeBase();
const enhancedKnowledgeBase = new EnhancedKnowledgeBase();

// Legacy knowledge base for backward compatibility
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
  // Check if the message is a test generation request
  const testGenerationResult = await handleTestGenerationRequest(message);
  if (testGenerationResult) {
    return testGenerationResult;
  }

  // Build context from recent conversation history
  const recentMessages = conversationHistory.slice(-10); // Last 10 messages for context
  const conversationContext = recentMessages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');
  
  // Create enhanced search query that includes conversation context
  const contextualQuery = conversationContext 
    ? `${conversationContext}\nCurrent question: ${message}`
    : message;
  
  // Search enhanced knowledge base with context
  const enhancedResults = enhancedKnowledgeBase.search(contextualQuery, 5);
  
  // If we have knowledge base results, check if this is a follow-up question
  if (enhancedResults.length > 0) {
    const isFollowUp = recentMessages.length > 0 && 
      recentMessages[recentMessages.length - 1]?.role === 'assistant';
    
    if (isFollowUp) {
      // For follow-up questions, use AI to provide more specific answers
      return await generateContextualFollowUp(message, conversationContext, enhancedResults);
    }
    
    return enhancedKnowledgeBase.generateResponse(message, enhancedResults);
  }
  
  // Fallback to original knowledge base with context
  const relevantKnowledge = knowledgeBase.search(contextualQuery, 3);
  
  if (relevantKnowledge.length > 0) {
    const isFollowUp = recentMessages.length > 0 && 
      recentMessages[recentMessages.length - 1]?.role === 'assistant';
    
    if (isFollowUp) {
      return await generateContextualFollowUp(message, conversationContext, relevantKnowledge);
    }
    
    return knowledgeBase.generateResponse(message, relevantKnowledge);
  }

  // Fallback to AI-generated response with knowledge base context
  const systemPrompt = `You are the Just In Time Medicine AI assistant for the College of Human Medicine at Michigan State University. You help medical students navigate their Shared Discovery Curriculum, learning societies, and academic resources.

Key CHM Learning Societies:
- Jane Adams Society: Named after the social worker and Nobel Peace Prize winner
- John Dewey Society: Named after the philosopher and educational reformer  
- Justin Morrill Society: Named after the sponsor of the Morrill Act establishing land-grant universities
- Dale Hale Williams Society: Named after the pioneering African American surgeon

Academic Phases:
- M1 Foundation Phase: First year focusing on foundational sciences, anatomy, physiology, and basic clinical skills
- MCE (Medical Clinical Experience): Clinical rotations in core specialties with patient care responsibilities
- LCE (Longitudinal Clinical Experience): Advanced clinical training with continuity of care focus (years 3-4)

Available Knowledge Topics:
${knowledgeBase.getCategories().join(', ')}

Respond helpfully about CHM curriculum, learning societies, academic support, research opportunities, board exam preparation, clinical training, and student wellness. If you don't have specific information, direct students to appropriate resources or suggest they speak with academic advisors.
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
• **Practice tests and assessments** - Try asking "Create a test for M1 week 3" or "Generate a quiz for MCE week 1"

What would you like to know more about?`;
  }
}

// Generate contextual follow-up responses using AI
async function generateContextualFollowUp(message: string, conversationContext: string, knowledgeResults: any[]): Promise<string> {
  try {
    const relevantContent = knowledgeResults.map(item => 
      `Title: ${item.title}\nContent: ${item.content}`
    ).join('\n\n---\n\n');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a medical education assistant for CHM at Michigan State University. 
          The user is asking a follow-up question based on previous conversation context.
          Use the provided knowledge base content to give a specific, detailed answer that directly addresses their follow-up question.
          Format your response with proper markdown, bullet points, and include relevant hashtags.
          Be specific and detailed, focusing on the exact aspect they're asking about.`
        },
        {
          role: "user",
          content: `Previous conversation context:
${conversationContext}

Available knowledge base content:
${relevantContent}

Current follow-up question: ${message}

Please provide a specific, detailed answer that directly addresses this follow-up question using the available knowledge.`
        }
      ],
      max_tokens: 600,
      temperature: 0.6
    });

    return completion.choices[0].message?.content || "I'd be happy to provide more specific information. Could you clarify what aspect you'd like to know more about?";
  } catch (error) {
    console.error('OpenAI API Error in follow-up:', error);
    
    // Fallback to knowledge base response
    if (knowledgeResults.length > 0) {
      if (knowledgeResults[0].generateResponse) {
        return knowledgeResults[0].generateResponse(message, knowledgeResults);
      } else {
        return enhancedKnowledgeBase.generateResponse(message, knowledgeResults);
      }
    }
    
    return "I'd be happy to help with more details. Could you be more specific about what you'd like to know?";
  }
}

// Handle test generation requests from chat
async function handleTestGenerationRequest(message: string): Promise<string | null> {
  const lowerMessage = message.toLowerCase();
  
  // Check for test/quiz generation keywords
  const isTestRequest = lowerMessage.includes('test') || lowerMessage.includes('quiz') || 
                       lowerMessage.includes('practice') || lowerMessage.includes('assessment') ||
                       lowerMessage.includes('exam');
  
  if (!isTestRequest) return null;
  
  // Extract phase and week information
  const phaseMatch = lowerMessage.match(/\b(m1|mce|lce)\b/);
  const weekMatch = lowerMessage.match(/week\s*(\d+)/);
  
  if (!phaseMatch) {
    return `I can create practice tests for CHM curriculum! Please specify which phase you're in:

**Available Phases:**
• **M1** - Foundation Phase (Weeks 1-6 available)
• **MCE** - Medical Clinical Experience (Weeks 1-6 available) 
• **LCE** - Longitudinal Clinical Experience (Weeks 1-6 available)

**Example requests:**
• "Create a test for M1 week 3"
• "Generate a quiz for MCE week 1"
• "Make practice questions for LCE week 2"

Which phase and week would you like a test for? #testing #curriculum #assessment`;
  }
  
  const phase = phaseMatch[1].toUpperCase();
  
  if (!weekMatch) {
    const availableWeeks = testGenerator.getAvailableWeeks(phase);
    return `I can create a practice test for **${phase}**! Please specify which week:

**Available weeks for ${phase}:** ${availableWeeks.join(', ')}

**Example:** "Create a test for ${phase} week ${availableWeeks[0]}"

Which week would you like a test for? #testing #${phase.toLowerCase()} #curriculum`;
  }
  
  const week = parseInt(weekMatch[1]);
  
  try {
    // Generate the test
    const test = await testGenerator.generateTest(phase, week, {
      numQuestions: 5, // Start with shorter tests for chat interface
      difficulty: 'mixed',
      questionTypes: ['multiple-choice', 'true-false'],
      timeAllowed: 15
    });
    
    if (!test) {
      return `Sorry, I don't have test content available for ${phase} week ${week}. Available weeks for ${phase}: ${testGenerator.getAvailableWeeks(phase).join(', ')}

Please try a different week! #testing #${phase.toLowerCase()}`;
    }
    
    // Format the test for chat display
    let response = `# ${test.title}\n\n`;
    response += `**Phase:** ${test.phase} | **Week:** ${test.week} | **Questions:** ${test.totalQuestions} | **Time:** ${test.timeAllowed} minutes\n\n`;
    
    // Add curriculum week info
    const weekData = testGenerator.getCurriculumWeek(phase, week);
    if (weekData) {
      response += `**Week Topics:** ${weekData.topics.join(', ')}\n\n`;
    }
    
    response += `---\n\n`;
    
    // Add questions
    test.questions.forEach((question, index) => {
      response += `**Question ${index + 1}** (${question.difficulty})\n`;
      response += `${question.question}\n\n`;
      
      if (question.type === 'multiple-choice' && question.options) {
        question.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
          const isCorrect = optIndex === question.correctAnswer;
          response += `${letter}. ${option} ${isCorrect ? '✓' : ''}\n`;
        });
        response += `\n`;
      }
      
      if (question.type === 'true-false') {
        response += `A. True\nB. False\n\n`;
      }
      
      response += `**Answer & Detailed Feedback:**\n`;
      response += `*Correct Answer:* ${question.type === 'multiple-choice' ? String.fromCharCode(65 + (question.correctAnswer as number)) : (question.correctAnswer ? 'A. True' : 'B. False')}\n\n`;
      
      if (question.type === 'multiple-choice' && question.optionFeedback && question.options) {
        response += `**Option Analysis:**\n`;
        question.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          const feedback = question.optionFeedback![optIndex] || 'No feedback available';
          response += `• **${letter}.** ${feedback}\n`;
        });
        response += `\n`;
      }
      
      response += `*Overall Explanation:* ${question.explanation}\n\n`;
      response += `---\n\n`;
    });
    
    response += `**Study Tips:**\n`;
    response += `• Review the key topics: ${weekData?.topics.join(', ')}\n`;
    response += `• Focus on understanding concepts, not just memorization\n`;
    response += `• Practice applying knowledge to clinical scenarios\n\n`;
    
    response += `Want another test? Try: "Create a ${phase} week ${week + 1} test" or "Generate harder questions for ${phase} week ${week}"\n\n`;
    response += `#testing #${phase.toLowerCase()} #week${week} #assessment #study`;
    
    return response;
    
  } catch (error) {
    console.error('Error generating test:', error);
    return `I encountered an error generating the test for ${phase} week ${week}. Please try again or contact support if the issue persists. #testing #error`;
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

  // Curriculum Testing Routes
  app.post("/api/tests/generate", async (req, res) => {
    try {
      const { phase, week, numQuestions = 10, difficulty = 'mixed', questionTypes = ['multiple-choice', 'true-false'] } = req.body;
      
      if (!phase || !week) {
        return res.status(400).json({ message: "Phase and week are required" });
      }
      
      const test = await testGenerator.generateTest(phase, week, {
        numQuestions,
        difficulty,
        questionTypes,
        timeAllowed: numQuestions * 2 // 2 minutes per question
      });
      
      if (!test) {
        return res.status(404).json({ message: `No test content available for ${phase} week ${week}` });
      }
      
      res.json(test);
    } catch (error) {
      console.error("Error generating test:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tests/curriculum/:phase", async (req, res) => {
    try {
      const phase = req.params.phase.toUpperCase();
      const availableWeeks = testGenerator.getAvailableWeeks(phase);
      
      if (availableWeeks.length === 0) {
        return res.status(404).json({ message: `Phase ${phase} not found` });
      }
      
      const weekData = availableWeeks.map(week => testGenerator.getCurriculumWeek(phase, week));
      
      res.json({
        phase,
        availableWeeks,
        weekData: weekData.filter(Boolean)
      });
    } catch (error) {
      console.error("Error fetching curriculum data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tests/curriculum/:phase/week/:week", async (req, res) => {
    try {
      const phase = req.params.phase.toUpperCase();
      const week = parseInt(req.params.week);
      
      const weekData = testGenerator.getCurriculumWeek(phase, week);
      
      if (!weekData) {
        return res.status(404).json({ message: `Week ${week} not found for phase ${phase}` });
      }
      
      res.json(weekData);
    } catch (error) {
      console.error("Error fetching week data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tests/phases", async (req, res) => {
    try {
      const phases = testGenerator.getAllPhases();
      const phaseInfo = phases.map(phase => ({
        phase,
        availableWeeks: testGenerator.getAvailableWeeks(phase),
        description: phase === 'M1' ? 'Foundation Phase' : 
                    phase === 'MCE' ? 'Medical Clinical Experience' : 
                    phase === 'LCE' ? 'Longitudinal Clinical Experience' : phase
      }));
      
      res.json(phaseInfo);
    } catch (error) {
      console.error("Error fetching phases:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Search and Suggestions Routes with Knowledge Base Integration
  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        // Return popular suggestions when no query, prioritizing enhanced content
        const enhancedSuggestions = enhancedKnowledgeBase.getSearchSuggestions();
        const originalSuggestions = knowledgeBase.getSearchSuggestions();
        const combinedSuggestions = [...enhancedSuggestions, ...originalSuggestions];
        return res.json(Array.from(new Set(combinedSuggestions)).slice(0, 10));
      }

      // Get suggestions from enhanced knowledge base first
      const enhancedSuggestions = enhancedKnowledgeBase.getSearchSuggestions()
        .filter(suggestion => 
          suggestion.toLowerCase().includes(query.toLowerCase())
        );

      // Get suggestions from original knowledge base
      const originalSuggestions = knowledgeBase.getSearchSuggestions()
        .filter(suggestion => 
          suggestion.toLowerCase().includes(query.toLowerCase())
        );

      // Add dynamic suggestions based on search results
      const enhancedResults = enhancedKnowledgeBase.search(query, 3);
      const dynamicSuggestions = enhancedResults.map(item => item.title);

      // Combine and deduplicate suggestions, prioritizing enhanced content
      const allSuggestions = Array.from(new Set([...enhancedSuggestions, ...dynamicSuggestions, ...originalSuggestions]));

      res.json(allSuggestions.slice(0, 8));
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