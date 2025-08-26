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
  optionFeedback?: string[]; // Detailed feedback for each option (why it's correct or incorrect)
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
    const prompt = `Create ${numQuestions} high-quality medical education test questions for the following curriculum week:

Title: ${weekData.title}
Topics: ${weekData.topics.join(', ')}
Learning Objectives: ${weekData.learningObjectives.join('; ')}
Key Terms: ${weekData.keyTerms.join(', ')}
Assessment Focus: ${weekData.assessmentFocus.join(', ')}

CRITICAL REQUIREMENTS for Educational Quality:

1. QUESTION DESIGN:
- Question types: ${questionTypes.join(', ')}
- Difficulty level: ${difficulty === 'mixed' ? 'mix of easy, medium, and hard' : difficulty}
- Create realistic clinical scenarios that test application, not just recall
- Use patient presentations, lab values, imaging findings, or case scenarios
- Avoid simple definition or fact-recall questions

2. EXPLANATION REQUIREMENTS:
- Overall explanation must be comprehensive (3-5 sentences minimum)
- Connect the correct answer to underlying pathophysiology, mechanisms, or clinical reasoning
- Explain WHY the concept is important in medical practice
- Include relevant clinical pearls or teaching points
- Reference how this applies to patient care or diagnosis

3. OPTION FEEDBACK REQUIREMENTS (CRITICAL):
Each option feedback must be educational and detailed:
- For CORRECT options: Explain the mechanism, pathophysiology, or clinical reasoning that makes it correct
- For INCORRECT options: Explain exactly why it's wrong, what condition/scenario it would apply to instead, and the key distinguishing features
- Include specific medical facts, values, or criteria that differentiate options
- Help students understand common misconceptions or similar conditions
- Each feedback should be 2-3 sentences with specific medical details

4. CLINICAL RELEVANCE:
- Questions should reflect real medical scenarios students will encounter
- Include appropriate medical terminology and professional language
- Incorporate evidence-based medicine principles where applicable
- Consider differential diagnoses, treatment decisions, or diagnostic workups

Example format for multiple choice:
{
  "question": "A 45-year-old patient with diabetes presents with acute onset of severe abdominal pain radiating to the back, nausea, and vomiting. Laboratory results show elevated serum lipase (450 U/L, normal <160) and glucose of 180 mg/dL. What is the most likely diagnosis?",
  "type": "multiple-choice",
  "options": ["Acute cholecystitis", "Acute pancreatitis", "Peptic ulcer disease", "Diabetic ketoacidosis"],
  "correctAnswer": 1,
  "explanation": "This presentation is classic for acute pancreatitis, particularly in a diabetic patient. The combination of severe epigastric pain radiating to the back, elevated lipase levels (>3x normal), and associated nausea/vomiting are pathognomonic. Diabetes is a known risk factor for pancreatitis due to potential triglyceride elevation and pancreatic microvascular changes. The elevated lipase is more specific than amylase for pancreatic inflammation.",
  "optionFeedback": [
    "Acute cholecystitis typically presents with right upper quadrant pain, often triggered by fatty meals, with Murphy's sign on examination. While it can cause nausea, the pain rarely radiates to the back and lipase levels are usually normal. Ultrasound would show gallbladder wall thickening or stones.",
    "Correct. Acute pancreatitis classically presents with severe epigastric pain radiating to the back, elevated pancreatic enzymes (lipase >3x normal), and systemic symptoms. In diabetics, this can be triggered by hypertriglyceridemia, medications, or idiopathic causes. The elevated lipase (450 U/L vs normal <160) confirms pancreatic inflammation.",
    "Peptic ulcer disease typically causes burning epigastric pain that may improve with food or antacids. While it can cause nausea, the pain rarely radiates to the back and would not cause elevated lipase levels. Severe cases might present with bleeding (hematemesis/melena) or perforation symptoms.",
    "Diabetic ketoacidosis presents with hyperglycemia (>250 mg/dL), ketosis, and metabolic acidosis. While this patient has diabetes, the glucose level (180 mg/dL) is not severely elevated, and the primary symptoms point to a pancreatic rather than metabolic cause. DKA would show ketones and anion gap acidosis on blood gas."
  ],
  "difficulty": "medium",
  "topic": "Acute abdominal pain evaluation",
  "learningObjective": "Diagnose acute pancreatitis using clinical presentation and laboratory findings"
}

Return only a JSON array of question objects with this enhanced educational content.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a senior medical education faculty member and board-certified physician creating rigorous assessment questions for Michigan State University College of Human Medicine students. Your questions must reflect real clinical scenarios that students will encounter in practice. Focus on clinical reasoning, differential diagnosis, and application of medical knowledge rather than rote memorization. Provide detailed, educational explanations that help students understand not just what is correct, but why other options are incorrect and how to distinguish between similar conditions. Your feedback should enhance learning and build clinical decision-making skills."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.8
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
        optionFeedback: q.optionFeedback,
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
    // Enhanced fallback questions with better educational content
    const questions: TestQuestion[] = [];
    
    // Create clinically relevant questions based on topics and learning objectives
    for (let i = 0; i < Math.min(numQuestions, weekData.topics.length); i++) {
      const topic = weekData.topics[i];
      const objective = weekData.learningObjectives[i] || weekData.learningObjectives[0];
      
      // Create more realistic clinical scenarios based on the topic
      const clinicalScenarios = this.generateClinicalScenario(topic, weekData.title);
      
      questions.push({
        id: `q${i + 1}`,
        question: clinicalScenarios.question,
        type: 'multiple-choice',
        options: clinicalScenarios.options,
        correctAnswer: clinicalScenarios.correctAnswer,
        explanation: `${topic} is a fundamental concept in ${weekData.title}. ${clinicalScenarios.explanation} Understanding this concept is crucial for medical practice as it directly impacts patient care, diagnosis, and treatment decisions. Students should focus on how this knowledge applies to real clinical scenarios and patient presentations.`,
        optionFeedback: clinicalScenarios.optionFeedback,
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

  private generateClinicalScenario(topic: string, weekTitle: string) {
    // Generate more realistic scenarios based on common medical topics
    const scenarios: Record<string, {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
      optionFeedback: string[];
    }> = {
      "Cell structure": {
        question: "A researcher studying cellular dysfunction notices abnormal protein accumulation in a patient's muscle biopsy. Which organelle is most likely impaired in this condition?",
        options: ["Endoplasmic reticulum", "Nucleus", "Mitochondria", "Golgi apparatus"],
        correctAnswer: 0,
        explanation: "The endoplasmic reticulum (ER) is responsible for protein folding and quality control. When ER function is impaired, misfolded proteins accumulate, leading to cellular stress and dysfunction commonly seen in various diseases.",
        optionFeedback: [
          "Correct: The endoplasmic reticulum handles protein folding and quality control. ER stress occurs when protein folding capacity is overwhelmed, leading to accumulation of misfolded proteins. This is seen in conditions like myopathies, neurodegenerative diseases, and metabolic disorders.",
          "Incorrect: While the nucleus controls protein synthesis through gene expression, it doesn't directly handle protein folding. Nuclear dysfunction would more likely present with transcriptional abnormalities rather than protein accumulation in the cytoplasm.",
          "Incorrect: Mitochondrial dysfunction typically presents with energy metabolism problems, muscle weakness, and lactic acidosis rather than protein accumulation. Mitochondrial diseases affect ATP production and cellular respiration.",
          "Incorrect: The Golgi apparatus modifies and packages proteins but isn't the primary site of protein folding. Golgi dysfunction would affect protein trafficking and post-translational modifications rather than causing protein accumulation."
        ]
      },
      "Membrane dynamics": {
        question: "A patient with cystic fibrosis has defective chloride transport across epithelial membranes. What type of membrane transport is primarily affected?",
        options: ["Active transport", "Simple diffusion", "Facilitated diffusion", "Osmosis"],
        correctAnswer: 0,
        explanation: "Cystic fibrosis involves a defective CFTR protein that normally uses active transport to move chloride ions against their concentration gradient across epithelial membranes.",
        optionFeedback: [
          "Correct: The CFTR protein is an ATP-powered chloride channel that uses active transport to move chloride ions against their concentration gradient. This requires energy and is essential for proper mucus consistency in the lungs and digestive system.",
          "Incorrect: Simple diffusion occurs down concentration gradients without protein assistance. CFTR specifically requires energy and protein-mediated transport, making this mechanism insufficient for chloride movement in epithelial cells.",
          "Incorrect: While facilitated diffusion uses membrane proteins, it only moves substances down their concentration gradient without energy. CFTR requires ATP to move chloride against gradients, making this purely facilitated diffusion.",
          "Incorrect: Osmosis specifically refers to water movement across membranes. While water balance is affected in CF due to altered chloride transport, the primary defect is in chloride ion transport, not osmosis itself."
        ]
      },
      "Protein structure": {
        question: "A patient presents with a connective tissue disorder affecting collagen. Which level of protein structure is most critical for collagen's mechanical strength?",
        options: ["Primary structure", "Secondary structure", "Tertiary structure", "Quaternary structure"],
        correctAnswer: 3,
        explanation: "Collagen's quaternary structure involves three polypeptide chains wound together in a triple helix, providing the tensile strength essential for connective tissue function.",
        optionFeedback: [
          "Incorrect: Primary structure refers to the amino acid sequence. While glycine at every third position is important for collagen, the sequence alone doesn't provide mechanical strength without proper folding and assembly.",
          "Incorrect: Secondary structure in collagen is primarily the polyproline II helix within each chain. While important, this doesn't provide the mechanical strength that comes from inter-chain interactions.",
          "Incorrect: Tertiary structure refers to individual chain folding. Collagen chains have minimal tertiary structure compared to globular proteins, and strength comes from inter-chain rather than intra-chain interactions.",
          "Correct: Quaternary structure involves three collagen chains (tropocollagen) wound together in a triple helix stabilized by hydrogen bonds and cross-links. This multi-chain structure provides the tremendous tensile strength that makes collagen ideal for connective tissues like tendons and ligaments."
        ]
      }
    };

    // Return a matching scenario or a generic one
    return scenarios[topic] || {
      question: `In the context of ${weekTitle.toLowerCase()}, which of the following best represents the clinical application of ${topic.toLowerCase()}?`,
      options: [
        `Direct clinical application in patient care`,
        `Purely theoretical concept with no clinical relevance`,
        `Only relevant in research settings`,
        `A historical concept no longer used in medicine`
      ],
      correctAnswer: 0,
      explanation: `${topic} has direct clinical applications that are essential for understanding patient pathophysiology and treatment approaches.`,
      optionFeedback: [
        `Correct: ${topic} has direct clinical applications that help healthcare providers understand disease mechanisms, interpret diagnostic tests, and make treatment decisions. Medical education emphasizes the practical application of basic science concepts.`,
        `Incorrect: All concepts taught in medical school have clinical relevance. ${topic} provides foundational knowledge that helps explain disease processes and guide clinical reasoning in patient care.`,
        `Incorrect: While ${topic} is studied in research, it has immediate clinical applications. Medical education focuses on clinically relevant science that practicing physicians use daily.`,
        `Incorrect: ${topic} represents current understanding in medicine and continues to be relevant for modern medical practice. Medical curricula emphasize contemporary, evidence-based concepts.`
      ]
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