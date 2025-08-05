import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  resources?: Array<{
    title: string;
    url: string;
    description: string;
  }>;
}

export async function generateChatResponse(
  message: string, 
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = []
): Promise<ChatResponse> {
  // Check if OpenAI API key is properly configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('*') || process.env.OPENAI_API_KEY.length < 20) {
    // Fallback response when API key is not properly configured
    console.log("Using fallback response due to invalid API key");
    return generateFallbackResponse(message);
  }

  try {

    const systemPrompt = `You are CHM AI Assistant, an expert on the College of Human Medicine's Shared Discovery Curriculum at JustInTimeMedicine. You help medical students navigate curriculum resources and answer educational questions.

Key information about CHM:
- Uses competency-based education with Shared Discovery Curriculum
- Has 4 Learning Societies: Jane Adams (36 students), John Dewey (23 students), Justin Morrill (62 students), Dale Hale Williams (35 students)
- Curriculum phases: M1 (foundational), Middle Clinical Experience (MCE), Late Clinical Experience (LCE)
- Offers resources like AAMC Core EPA, simulation resources, board exam prep, clinical media
- Key sections: Class Specific Information, Academic Achievement, Service Learning, Student Research, Global Electives
- Special programs: ASK I-V (Advanced Skills & Knowledge), intersessions
- Resources include: Medical eBooks, CXR Tutorials, EKG Resources, Quick Hitters, Reference Tables

When responding:
1. Be helpful, professional, and specific to medical education
2. Reference actual CHM resources and sections when relevant
3. Provide direct links or specific section names when possible
4. If you don't know something specific, guide them to appropriate resources
5. Keep responses concise but informative
6. Include relevant quick suggestions when helpful

Respond in JSON format with: {"message": "your response", "suggestions": ["suggestion1", "suggestion2"], "resources": [{"title": "Resource Name", "url": "/curriculum/section", "description": "Brief description"}]}`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-8), // Keep last 8 messages for context
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"message": "I apologize, but I encountered an error. Please try again."}');
    
    return {
      message: result.message || "I'm here to help with CHM curriculum questions.",
      suggestions: result.suggestions || [],
      resources: result.resources || [],
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Return fallback response instead of throwing error
    return generateFallbackResponse(message);
  }
}

function generateFallbackResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();
  
  // Curriculum-related responses
  if (lowerMessage.includes('curriculum') || lowerMessage.includes('m1') || lowerMessage.includes('mce') || lowerMessage.includes('lce')) {
    return {
      message: "The CHM curriculum follows a competency-based approach with three main phases: M1 (foundational), MCE (Middle Clinical Experience), and LCE (Late Clinical Experience with clerkships). Each phase builds upon previous learning to prepare you for medical practice.",
      suggestions: ["View M1 schedule", "Learn about MCE rotations", "Check LCE clerkships"],
      resources: [
        { title: "M1 Content by Weeks", url: "/curriculum/m1-weeks-by-date", description: "Detailed M1 curriculum schedule" },
        { title: "MCE Rotation Topics", url: "/curriculum/mce-rotation-topics", description: "Middle Clinical Experience rotations" },
        { title: "LCE Clerkship Handbooks", url: "/curriculum/clerkship-handbooks", description: "Late Clinical Experience resources" }
      ]
    };
  }
  
  // Learning societies
  if (lowerMessage.includes('learning society') || lowerMessage.includes('societies') || lowerMessage.includes('jane') || lowerMessage.includes('dewey') || lowerMessage.includes('morrill') || lowerMessage.includes('williams')) {
    return {
      message: "CHM has four Learning Societies: Jane Adams (36 students), John Dewey (23 students), Justin Morrill (62 students), and Dale Hale Williams (35 students). These societies foster collaborative learning and community building throughout your medical education.",
      suggestions: ["Learn about society activities", "Check society events", "Connect with society members"],
      resources: [
        { title: "Jane Adams Learning Society", url: "/curriculum/jane-addams-learning-society", description: "Collaborative learning community" },
        { title: "Learning Society Overview", url: "/curriculum/learning-societies", description: "Information about all four societies" }
      ]
    };
  }
  
  // Resources and study materials
  if (lowerMessage.includes('resource') || lowerMessage.includes('study') || lowerMessage.includes('book') || lowerMessage.includes('usmle') || lowerMessage.includes('board')) {
    return {
      message: "CHM provides extensive resources including AAMC Core EPA materials, medical eBooks, board exam preparation, simulation resources, CXR tutorials, EKG resources, and quick reference materials to support your learning.",
      suggestions: ["Browse medical eBooks", "Access board prep", "View clinical resources"],
      resources: [
        { title: "Medical eBooks", url: "https://libguides.lib.msu.edu/medicalebooks", description: "Access to medical textbooks" },
        { title: "Board Exam Preparation", url: "https://libguides.lib.msu.edu/medicalboardexamprep/usmle1", description: "USMLE preparation resources" },
        { title: "Clinical Media Resources", url: "/curriculum/clinical-media-resources", description: "Clinical videos and multimedia" }
      ]
    };
  }
  
  // Academic support
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('academic') || lowerMessage.includes('achievement')) {
    return {
      message: "The Office of Academic Achievement provides comprehensive support services including tutoring, academic planning, and success strategies. Additional support includes health & wellness resources and research opportunities.",
      suggestions: ["Contact academic support", "View wellness resources", "Explore research opportunities"],
      resources: [
        { title: "Office of Academic Achievement", url: "/curriculum/academic_achievement", description: "Academic support services" },
        { title: "Health and Wellness", url: "/curriculum/health-wellness", description: "Student wellness resources" },
        { title: "Student Research", url: "/curriculum/chm-research", description: "Research opportunities" }
      ]
    };
  }
  
  // Default response
  return {
    message: "I'm the CHM AI Assistant, here to help you with College of Human Medicine curriculum questions, resources, and academic support. I can provide information about learning societies, curriculum phases, clinical resources, and academic achievement services.",
    suggestions: ["Ask about curriculum", "Find learning resources", "Get academic support", "Learn about societies"],
    resources: [
      { title: "Class Specific Information", url: "/curriculum/class-specific-information-overview", description: "Overview of class information and schedules" },
      { title: "Academic Achievement", url: "/curriculum/academic_achievement", description: "Academic support and success resources" }
    ]
  };
}

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a brief title (max 6 words) for a medical education conversation based on the first message. Focus on the main topic. Respond with just the title, no quotes or extra text."
        },
        { role: "user", content: firstMessage }
      ],
      max_tokens: 20,
      temperature: 0.5,
    });

    return response.choices[0].message.content?.trim() || "CHM Assistance";
  } catch (error) {
    console.error("Error generating title:", error);
    return "CHM Assistance";
  }
}
