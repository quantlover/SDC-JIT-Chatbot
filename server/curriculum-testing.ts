import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "demo_key"
});

export interface CurriculumWeek {
  week: number;
  title: string;
  topics: string[];
  learningObjectives: string[];
  keyTerms: string[];
  assessmentFocus: string[];
}

export interface TestQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'clinical-case';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  learningObjective: string;
}

export interface GeneratedTest {
  title: string;
  phase: string;
  week: number;
  totalQuestions: number;
  questions: TestQuestion[];
  timeAllowed: number; // in minutes
  passingScore: number; // percentage
}

// Comprehensive curriculum data by phase and week
export const curriculumData: Record<string, CurriculumWeek[]> = {
  M1: [
    {
      week: 1,
      title: "Introduction to Medical School and Learning Societies",
      topics: ["Medical professionalism", "Learning society orientation", "Study strategies", "CHM mission and values"],
      learningObjectives: [
        "Understand the CHM Shared Discovery Curriculum structure",
        "Identify your learning society and its values",
        "Develop effective study habits for medical school"
      ],
      keyTerms: ["Learning societies", "Shared Discovery Curriculum", "Professional identity"],
      assessmentFocus: ["Curriculum overview", "Learning society characteristics", "Professional behavior"]
    },
    {
      week: 2,
      title: "Cell Biology and Biochemistry Foundations",
      topics: ["Cell structure", "Membrane dynamics", "Protein structure", "Enzyme kinetics"],
      learningObjectives: [
        "Describe cellular organelles and their functions",
        "Explain membrane transport mechanisms",
        "Analyze enzyme kinetics and regulation"
      ],
      keyTerms: ["Organelles", "Transport proteins", "Enzyme kinetics", "Protein folding"],
      assessmentFocus: ["Cell membrane function", "Enzyme mechanisms", "Protein structure-function"]
    },
    {
      week: 3,
      title: "Human Anatomy: Musculoskeletal System",
      topics: ["Bone structure", "Joint classifications", "Muscle physiology", "Movement mechanics"],
      learningObjectives: [
        "Identify major bones and their anatomical features",
        "Classify joint types and movements",
        "Describe muscle contraction mechanisms"
      ],
      keyTerms: ["Osteology", "Arthrology", "Myology", "Biomechanics"],
      assessmentFocus: ["Bone identification", "Joint movements", "Muscle actions"]
    },
    {
      week: 4,
      title: "Cardiovascular System Basics",
      topics: ["Heart anatomy", "Cardiac cycle", "Blood vessels", "Circulation pathways"],
      learningObjectives: [
        "Describe heart chambers and valves",
        "Explain the cardiac cycle phases",
        "Trace blood flow through systemic and pulmonary circuits"
      ],
      keyTerms: ["Cardiac cycle", "Systole", "Diastole", "Circulation"],
      assessmentFocus: ["Heart anatomy", "Cardiac cycle timing", "Blood flow pathways"]
    },
    {
      week: 5,
      title: "Respiratory System and Gas Exchange",
      topics: ["Lung anatomy", "Ventilation mechanics", "Gas exchange", "Oxygen transport"],
      learningObjectives: [
        "Describe respiratory tract anatomy",
        "Explain ventilation and perfusion matching",
        "Analyze oxygen and carbon dioxide transport"
      ],
      keyTerms: ["Alveoli", "Ventilation", "Perfusion", "Gas exchange"],
      assessmentFocus: ["Lung structure", "Breathing mechanics", "Gas transport"]
    },
    {
      week: 6,
      title: "Nervous System Introduction",
      topics: ["Neuron structure", "Action potentials", "Synaptic transmission", "CNS organization"],
      learningObjectives: [
        "Describe neuron anatomy and types",
        "Explain action potential generation and propagation",
        "Analyze synaptic transmission mechanisms"
      ],
      keyTerms: ["Neurons", "Action potential", "Synapses", "Neurotransmitters"],
      assessmentFocus: ["Neuron function", "Electrical conduction", "Synaptic mechanisms"]
    }
  ],
  MCE: [
    {
      week: 1,
      title: "Internal Medicine Rotation - Week 1",
      topics: ["History taking", "Physical examination", "Differential diagnosis", "Common conditions"],
      learningObjectives: [
        "Perform comprehensive history and physical exam",
        "Develop differential diagnoses for common presentations",
        "Present patients effectively to attending physicians"
      ],
      keyTerms: ["H&P", "Differential diagnosis", "Clinical reasoning", "Patient presentation"],
      assessmentFocus: ["History taking skills", "Physical exam techniques", "Clinical reasoning"]
    },
    {
      week: 2,
      title: "Internal Medicine Rotation - Week 2",
      topics: ["Laboratory interpretation", "Imaging studies", "Treatment planning", "Patient management"],
      learningObjectives: [
        "Interpret common laboratory values",
        "Order appropriate diagnostic tests",
        "Develop evidence-based treatment plans"
      ],
      keyTerms: ["Lab values", "Diagnostic imaging", "Evidence-based medicine", "Treatment protocols"],
      assessmentFocus: ["Lab interpretation", "Diagnostic reasoning", "Treatment planning"]
    },
    {
      week: 3,
      title: "Surgery Rotation - Week 1",
      topics: ["Surgical anatomy", "Preoperative care", "Sterile technique", "Basic procedures"],
      learningObjectives: [
        "Understand surgical anatomy for common procedures",
        "Perform preoperative patient assessment",
        "Demonstrate proper sterile technique"
      ],
      keyTerms: ["Surgical anatomy", "Preoperative assessment", "Sterile technique", "Surgical procedures"],
      assessmentFocus: ["Anatomy knowledge", "Sterile technique", "Preoperative care"]
    },
    {
      week: 4,
      title: "Pediatrics Rotation - Week 1",
      topics: ["Pediatric development", "Growth charts", "Common pediatric conditions", "Parent communication"],
      learningObjectives: [
        "Assess normal pediatric development",
        "Interpret growth charts and milestones",
        "Communicate effectively with children and parents"
      ],
      keyTerms: ["Development milestones", "Growth charts", "Pediatric communication", "Family-centered care"],
      assessmentFocus: ["Development assessment", "Growth evaluation", "Communication skills"]
    },
    {
      week: 5,
      title: "Psychiatry Rotation - Week 1",
      topics: ["Mental status exam", "Psychiatric interview", "Common disorders", "Treatment approaches"],
      learningObjectives: [
        "Perform mental status examination",
        "Conduct psychiatric interviews",
        "Recognize common psychiatric disorders"
      ],
      keyTerms: ["Mental status exam", "Psychiatric interview", "DSM-5", "Therapeutic alliance"],
      assessmentFocus: ["Mental status exam", "Interview techniques", "Diagnostic criteria"]
    },
    {
      week: 6,
      title: "Emergency Medicine Rotation - Week 1",
      topics: ["Triage principles", "Emergency procedures", "Critical care", "Trauma management"],
      learningObjectives: [
        "Apply triage principles in emergency settings",
        "Perform emergency procedures",
        "Manage critically ill patients"
      ],
      keyTerms: ["Triage", "Emergency procedures", "Critical care", "Trauma protocols"],
      assessmentFocus: ["Triage decisions", "Emergency skills", "Critical thinking"]
    }
  ],
  LCE: [
    {
      week: 1,
      title: "Acting Internship - Internal Medicine Week 1",
      topics: ["Independent patient management", "Teaching responsibilities", "Quality improvement", "Leadership skills"],
      learningObjectives: [
        "Manage patients independently with supervision",
        "Teach medical students and residents",
        "Participate in quality improvement initiatives"
      ],
      keyTerms: ["Acting intern", "Patient management", "Medical education", "Quality improvement"],
      assessmentFocus: ["Independent decision making", "Teaching skills", "Leadership abilities"]
    },
    {
      week: 2,
      title: "Subspecialty Elective - Cardiology",
      topics: ["Advanced cardiac diagnostics", "Interventional procedures", "Complex cases", "Research applications"],
      learningObjectives: [
        "Interpret advanced cardiac diagnostics",
        "Understand interventional cardiology procedures",
        "Analyze complex cardiovascular cases"
      ],
      keyTerms: ["Cardiac catheterization", "Echocardiography", "Interventional cardiology", "Cardiac research"],
      assessmentFocus: ["Advanced diagnostics", "Procedure knowledge", "Case analysis"]
    },
    {
      week: 3,
      title: "USMLE Step 2 Preparation",
      topics: ["Clinical knowledge review", "Test-taking strategies", "Practice examinations", "Knowledge gaps"],
      learningObjectives: [
        "Review high-yield clinical concepts",
        "Apply effective test-taking strategies",
        "Identify and address knowledge gaps"
      ],
      keyTerms: ["USMLE Step 2", "Clinical knowledge", "Test strategies", "Knowledge assessment"],
      assessmentFocus: ["Clinical reasoning", "Test performance", "Knowledge application"]
    },
    {
      week: 4,
      title: "Research Rotation",
      topics: ["Research methodology", "Data analysis", "Literature review", "Presentation skills"],
      learningObjectives: [
        "Design research studies",
        "Analyze research data",
        "Present research findings effectively"
      ],
      keyTerms: ["Research design", "Statistical analysis", "Literature review", "Research presentation"],
      assessmentFocus: ["Research methods", "Data interpretation", "Communication skills"]
    },
    {
      week: 5,
      title: "International/Away Rotation",
      topics: ["Global health", "Cultural competency", "Healthcare systems", "International medicine"],
      learningObjectives: [
        "Understand global health challenges",
        "Develop cultural competency skills",
        "Compare healthcare systems internationally"
      ],
      keyTerms: ["Global health", "Cultural competency", "Healthcare systems", "International medicine"],
      assessmentFocus: ["Cultural awareness", "Global health knowledge", "Adaptability"]
    },
    {
      week: 6,
      title: "Residency Interview Preparation",
      topics: ["Interview skills", "Program evaluation", "Rank list strategy", "Match preparation"],
      learningObjectives: [
        "Develop effective interview skills",
        "Evaluate residency programs objectively",
        "Create strategic rank lists"
      ],
      keyTerms: ["Residency interviews", "Program evaluation", "Match process", "Rank lists"],
      assessmentFocus: ["Interview performance", "Decision making", "Professional presentation"]
    }
  ]
};

export class CurriculumTestGenerator {
  constructor() {}

  async generateTest(phase: string, week: number, options: {
    numQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer' | 'clinical-case')[];
    timeAllowed?: number;
  } = {}): Promise<GeneratedTest | null> {
    const {
      numQuestions = 10,
      difficulty = 'mixed',
      questionTypes = ['multiple-choice', 'true-false', 'short-answer'],
      timeAllowed = 30
    } = options;

    // Get curriculum data for the specified phase and week
    const phaseData = curriculumData[phase.toUpperCase()];
    if (!phaseData) {
      return null;
    }

    const weekData = phaseData.find(w => w.week === week);
    if (!weekData) {
      return null;
    }

    try {
      // Generate questions using AI
      const questions = await this.generateQuestionsWithAI(weekData, numQuestions, difficulty, questionTypes);
      
      return {
        title: `${phase} Week ${week} Assessment: ${weekData.title}`,
        phase: phase.toUpperCase(),
        week,
        totalQuestions: questions.length,
        questions,
        timeAllowed,
        passingScore: 70
      };
    } catch (error) {
      console.error('Error generating test:', error);
      // Fallback to predefined questions
      return this.generateFallbackTest(weekData, phase, week, numQuestions);
    }
  }

  private async generateQuestionsWithAI(
    weekData: CurriculumWeek,
    numQuestions: number,
    difficulty: string,
    questionTypes: string[]
  ): Promise<TestQuestion[]> {
    const prompt = `Create ${numQuestions} medical education test questions for the following curriculum week:

Title: ${weekData.title}
Topics: ${weekData.topics.join(', ')}
Learning Objectives: ${weekData.learningObjectives.join('; ')}
Key Terms: ${weekData.keyTerms.join(', ')}
Assessment Focus: ${weekData.assessmentFocus.join(', ')}

Requirements:
- Question types: ${questionTypes.join(', ')}
- Difficulty level: ${difficulty === 'mixed' ? 'mix of easy, medium, and hard' : difficulty}
- Format each question as JSON with: question, type, options (if multiple choice), correctAnswer, explanation, difficulty, topic, learningObjective
- Make questions clinically relevant and test understanding, not just memorization
- Include realistic clinical scenarios where appropriate

Return only a JSON array of question objects.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical education expert creating assessment questions for CHM students. Generate high-quality, clinically relevant questions that test understanding and application of knowledge."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    try {
      // Extract JSON from response (in case it's wrapped in markdown)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const jsonText = jsonMatch ? jsonMatch[0] : response;
      const questions = JSON.parse(jsonText);
      
      return questions.map((q: any, index: number) => ({
        id: `q${index + 1}`,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium',
        topic: q.topic || weekData.topics[0],
        learningObjective: q.learningObjective || weekData.learningObjectives[0]
      }));
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Invalid AI response format');
    }
  }

  private generateFallbackTest(
    weekData: CurriculumWeek,
    phase: string,
    week: number,
    numQuestions: number
  ): GeneratedTest {
    // Generate basic questions as fallback
    const questions: TestQuestion[] = [];
    
    // Create questions based on topics and learning objectives
    for (let i = 0; i < Math.min(numQuestions, weekData.topics.length); i++) {
      const topic = weekData.topics[i];
      const objective = weekData.learningObjectives[i] || weekData.learningObjectives[0];
      
      questions.push({
        id: `q${i + 1}`,
        question: `Which of the following best describes ${topic.toLowerCase()}?`,
        type: 'multiple-choice',
        options: [
          `A key concept in ${topic}`,
          `Not related to ${topic}`,
          `An advanced topic beyond this week`,
          `A prerequisite for ${topic}`
        ],
        correctAnswer: 0,
        explanation: `This question tests understanding of ${topic} as covered in ${weekData.title}.`,
        difficulty: 'medium',
        topic,
        learningObjective: objective
      });
    }

    return {
      title: `${phase} Week ${week} Assessment: ${weekData.title}`,
      phase: phase.toUpperCase(),
      week,
      totalQuestions: questions.length,
      questions,
      timeAllowed: 30,
      passingScore: 70
    };
  }

  getAvailableWeeks(phase: string): number[] {
    const phaseData = curriculumData[phase.toUpperCase()];
    return phaseData ? phaseData.map(week => week.week) : [];
  }

  getCurriculumWeek(phase: string, week: number): CurriculumWeek | null {
    const phaseData = curriculumData[phase.toUpperCase()];
    if (!phaseData) return null;
    return phaseData.find(w => w.week === week) || null;
  }

  getAllPhases(): string[] {
    return Object.keys(curriculumData);
  }
}

export const testGenerator = new CurriculumTestGenerator();