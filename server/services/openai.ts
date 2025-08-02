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
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<ChatResponse> {
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
    throw new Error("Failed to generate response. Please try again.");
  }
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
