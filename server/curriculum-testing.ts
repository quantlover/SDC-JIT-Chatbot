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
  week?: number;
  topic?: string; // For topic-specific tests
  difficulty?: 'easy' | 'medium' | 'difficult';
  totalQuestions: number;
  questions: TestQuestion[];
  timeAllowed: number; // in minutes
  passingScore: number; // percentage
}

// Medical topic test banks organized by system and difficulty
export const medicalTopicTestBanks = {
  cardiovascular: {
    easy: [
      {
        id: 'cv-easy-1',
        question: 'What is the normal resting heart rate range for adults?',
        type: 'multiple-choice' as const,
        options: ['40-60 bpm', '60-100 bpm', '100-120 bpm', '120-150 bpm'],
        correctAnswer: 1,
        explanation: 'The normal resting heart rate for adults is 60-100 beats per minute.',
        difficulty: 'easy' as const,
        topic: 'Cardiovascular Physiology',
        learningObjective: 'Identify normal cardiac vital signs'
      },
      {
        id: 'cv-easy-2',
        question: 'Which chamber of the heart pumps blood to the systemic circulation?',
        type: 'multiple-choice' as const,
        options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
        correctAnswer: 3,
        explanation: 'The left ventricle pumps oxygenated blood to the systemic circulation.',
        difficulty: 'easy' as const,
        topic: 'Cardiac Anatomy',
        learningObjective: 'Identify heart chamber functions'
      }
    ],
    medium: [
      {
        id: 'cv-med-1',
        question: 'A patient presents with chest pain and ST-elevation on ECG leads II, III, and aVF. Which coronary artery is most likely occluded?',
        type: 'multiple-choice' as const,
        options: ['Left anterior descending', 'Right coronary artery', 'Left circumflex', 'Left main'],
        correctAnswer: 1,
        explanation: 'ST-elevation in leads II, III, and aVF indicates an inferior wall MI, typically caused by RCA occlusion.',
        difficulty: 'medium' as const,
        topic: 'Myocardial Infarction',
        learningObjective: 'Correlate ECG findings with coronary anatomy'
      }
    ],
    difficult: [
      {
        id: 'cv-hard-1',
        question: 'Calculate the cardiac output for a patient with stroke volume of 70mL and heart rate of 80 bpm, then determine the ejection fraction if end-diastolic volume is 140mL.',
        type: 'short-answer' as const,
        correctAnswer: 'CO = 5.6 L/min, EF = 50%',
        explanation: 'CO = SV × HR = 70mL × 80 = 5600mL/min = 5.6L/min. EF = SV/EDV = 70/140 = 0.5 = 50%',
        difficulty: 'difficult' as const,
        topic: 'Cardiac Output Calculations',
        learningObjective: 'Calculate and interpret hemodynamic parameters'
      }
    ]
  },
  respiratory: {
    easy: [
      {
        id: 'resp-easy-1',
        question: 'What is the primary muscle of inspiration?',
        type: 'multiple-choice' as const,
        options: ['Intercostal muscles', 'Diaphragm', 'Accessory muscles', 'Abdominal muscles'],
        correctAnswer: 1,
        explanation: 'The diaphragm is the primary muscle responsible for inspiration.',
        difficulty: 'easy' as const,
        topic: 'Respiratory Mechanics',
        learningObjective: 'Identify muscles of respiration'
      }
    ],
    medium: [
      {
        id: 'resp-med-1',
        question: 'A patient with COPD shows decreased FEV1/FVC ratio. What does this indicate?',
        type: 'multiple-choice' as const,
        options: ['Restrictive disease', 'Obstructive disease', 'Normal spirometry', 'Neuromuscular weakness'],
        correctAnswer: 1,
        explanation: 'Decreased FEV1/FVC ratio (<0.7) indicates obstructive lung disease like COPD.',
        difficulty: 'medium' as const,
        topic: 'Pulmonary Function Tests',
        learningObjective: 'Interpret spirometry results'
      }
    ],
    difficult: [
      {
        id: 'resp-hard-1',
        question: 'Calculate the A-a gradient for a patient breathing room air with PaO2 = 80 mmHg, given PAO2 = 100 mmHg. What does this suggest?',
        type: 'short-answer' as const,
        correctAnswer: 'A-a gradient = 20 mmHg, suggests mild gas exchange impairment',
        explanation: 'A-a gradient = PAO2 - PaO2 = 100 - 80 = 20 mmHg. Normal is <15 mmHg, so this suggests mild impairment.',
        difficulty: 'difficult' as const,
        topic: 'Gas Exchange',
        learningObjective: 'Calculate and interpret A-a gradient'
      }
    ]
  },
  renal: {
    easy: [
      {
        id: 'renal-easy-1',
        question: 'Which part of the nephron is primarily responsible for filtration?',
        type: 'multiple-choice' as const,
        options: ['Proximal tubule', 'Loop of Henle', 'Glomerulus', 'Distal tubule'],
        correctAnswer: 2,
        explanation: 'The glomerulus is the site of filtration in the nephron.',
        difficulty: 'easy' as const,
        topic: 'Renal Anatomy',
        learningObjective: 'Identify nephron components and functions'
      }
    ],
    medium: [
      {
        id: 'renal-med-1',
        question: 'A patient has proteinuria, hypoalbuminemia, and edema. What syndrome is this?',
        type: 'multiple-choice' as const,
        options: ['Nephritic syndrome', 'Nephrotic syndrome', 'Acute tubular necrosis', 'Chronic kidney disease'],
        correctAnswer: 1,
        explanation: 'The triad of proteinuria, hypoalbuminemia, and edema defines nephrotic syndrome.',
        difficulty: 'medium' as const,
        topic: 'Glomerular Disease',
        learningObjective: 'Distinguish nephritic vs nephrotic syndromes'
      }
    ],
    difficult: [
      {
        id: 'renal-hard-1',
        question: 'Calculate GFR using creatinine clearance: Urine creatinine = 120 mg/dL, Serum creatinine = 1.2 mg/dL, Urine flow = 1.5 mL/min.',
        type: 'short-answer' as const,
        correctAnswer: 'GFR = 150 mL/min',
        explanation: 'GFR = (Urine creatinine × Urine flow) / Serum creatinine = (120 × 1.5) / 1.2 = 150 mL/min',
        difficulty: 'difficult' as const,
        topic: 'Renal Function Assessment',
        learningObjective: 'Calculate GFR and interpret results'
      }
    ]
  },
  immunology: {
    easy: [
      {
        id: 'immuno-easy-1',
        question: 'Which type of immunity provides immediate, non-specific protection?',
        type: 'multiple-choice' as const,
        options: ['Adaptive immunity', 'Innate immunity', 'Humoral immunity', 'Cell-mediated immunity'],
        correctAnswer: 1,
        explanation: 'Innate immunity provides immediate, non-specific protection against pathogens.',
        difficulty: 'easy' as const,
        topic: 'Immune System Overview',
        learningObjective: 'Distinguish innate vs adaptive immunity'
      }
    ],
    medium: [
      {
        id: 'immuno-med-1',
        question: 'A patient with peanut allergy experiences anaphylaxis. What type of hypersensitivity is this?',
        type: 'multiple-choice' as const,
        options: ['Type I', 'Type II', 'Type III', 'Type IV'],
        correctAnswer: 0,
        explanation: 'Anaphylaxis is a Type I (immediate) hypersensitivity reaction mediated by IgE.',
        difficulty: 'medium' as const,
        topic: 'Hypersensitivity Reactions',
        learningObjective: 'Classify hypersensitivity reactions'
      }
    ],
    difficult: [
      {
        id: 'immuno-hard-1',
        question: 'Explain the molecular mechanism of MHC Class I antigen presentation and its clinical significance in transplant rejection.',
        type: 'short-answer' as const,
        correctAnswer: 'MHC I presents intracellular peptides to CD8+ T cells, critical for transplant compatibility',
        explanation: 'MHC Class I molecules present intracellular peptides on all nucleated cells to CD8+ T cells. Mismatch leads to transplant rejection.',
        difficulty: 'difficult' as const,
        topic: 'Antigen Presentation',
        learningObjective: 'Explain MHC function and transplant immunology'
      }
    ]
  }
};

// Medical topic test banks organized by system and difficulty
export const medicalTopicTestBanks = {
  cardiovascular: {
    easy: [
      {
        id: 'cv-easy-1',
        question: 'What is the normal resting heart rate range for adults?',
        type: 'multiple-choice' as const,
        options: ['40-60 bpm', '60-100 bpm', '100-120 bpm', '120-150 bpm'],
        correctAnswer: 1,
        explanation: 'The normal resting heart rate for adults is 60-100 beats per minute.',
        difficulty: 'easy' as const,
        topic: 'Cardiovascular Physiology',
        learningObjective: 'Identify normal cardiac vital signs'
      },
      {
        id: 'cv-easy-2',
        question: 'Which chamber of the heart pumps blood to the systemic circulation?',
        type: 'multiple-choice' as const,
        options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
        correctAnswer: 3,
        explanation: 'The left ventricle pumps oxygenated blood to the systemic circulation.',
        difficulty: 'easy' as const,
        topic: 'Cardiac Anatomy',
        learningObjective: 'Identify heart chamber functions'
      },
      {
        id: 'cv-easy-3',
        question: 'What does systolic blood pressure represent?',
        type: 'multiple-choice' as const,
        options: ['Pressure during ventricular filling', 'Pressure during ventricular contraction', 'Pressure in the atria', 'Pressure in the veins'],
        correctAnswer: 1,
        explanation: 'Systolic blood pressure represents the pressure in arteries during ventricular contraction.',
        difficulty: 'easy' as const,
        topic: 'Blood Pressure',
        learningObjective: 'Define systolic and diastolic pressure'
      }
    ],
    medium: [
      {
        id: 'cv-med-1',
        question: 'A patient presents with chest pain and ST-elevation on ECG leads II, III, and aVF. Which coronary artery is most likely occluded?',
        type: 'multiple-choice' as const,
        options: ['Left anterior descending', 'Right coronary artery', 'Left circumflex', 'Left main'],
        correctAnswer: 1,
        explanation: 'ST-elevation in leads II, III, and aVF indicates an inferior wall MI, typically caused by RCA occlusion.',
        difficulty: 'medium' as const,
        topic: 'Myocardial Infarction',
        learningObjective: 'Correlate ECG findings with coronary anatomy'
      },
      {
        id: 'cv-med-2',
        question: 'A patient with heart failure shows increased JVD and peripheral edema but clear lungs. What type of heart failure is this?',
        type: 'multiple-choice' as const,
        options: ['Left-sided systolic', 'Left-sided diastolic', 'Right-sided', 'Biventricular'],
        correctAnswer: 2,
        explanation: 'Right-sided heart failure presents with systemic congestion (JVD, edema) but spares the lungs.',
        difficulty: 'medium' as const,
        topic: 'Heart Failure',
        learningObjective: 'Differentiate types of heart failure'
      }
    ],
    difficult: [
      {
        id: 'cv-hard-1',
        question: 'Calculate the cardiac output for a patient with stroke volume of 70mL and heart rate of 80 bpm, then determine the ejection fraction if end-diastolic volume is 140mL.',
        type: 'short-answer' as const,
        correctAnswer: 'CO = 5.6 L/min, EF = 50%',
        explanation: 'CO = SV × HR = 70mL × 80 = 5600mL/min = 5.6L/min. EF = SV/EDV = 70/140 = 0.5 = 50%',
        difficulty: 'difficult' as const,
        topic: 'Cardiac Output Calculations',
        learningObjective: 'Calculate and interpret hemodynamic parameters'
      },
      {
        id: 'cv-hard-2',
        question: 'A patient has aortic stenosis with valve area of 0.8 cm². Calculate the pressure gradient if cardiac output is 5 L/min. What is the clinical significance?',
        type: 'short-answer' as const,
        correctAnswer: 'Severe aortic stenosis with significant pressure gradient',
        explanation: 'Valve area <1.0 cm² indicates severe aortic stenosis. High gradient suggests significant obstruction requiring intervention.',
        difficulty: 'difficult' as const,
        topic: 'Valvular Disease',
        learningObjective: 'Calculate valve parameters and assess severity'
      }
    ]
  },
  respiratory: {
    easy: [
      {
        id: 'resp-easy-1',
        question: 'What is the primary muscle of inspiration?',
        type: 'multiple-choice' as const,
        options: ['Intercostal muscles', 'Diaphragm', 'Accessory muscles', 'Abdominal muscles'],
        correctAnswer: 1,
        explanation: 'The diaphragm is the primary muscle responsible for inspiration.',
        difficulty: 'easy' as const,
        topic: 'Respiratory Mechanics',
        learningObjective: 'Identify muscles of respiration'
      },
      {
        id: 'resp-easy-2',
        question: 'Where does gas exchange occur in the lungs?',
        type: 'multiple-choice' as const,
        options: ['Bronchi', 'Bronchioles', 'Alveoli', 'Trachea'],
        correctAnswer: 2,
        explanation: 'Gas exchange occurs in the alveoli, where oxygen and carbon dioxide cross the respiratory membrane.',
        difficulty: 'easy' as const,
        topic: 'Lung Anatomy',
        learningObjective: 'Identify sites of gas exchange'
      }
    ],
    medium: [
      {
        id: 'resp-med-1',
        question: 'A patient with COPD shows decreased FEV1/FVC ratio. What does this indicate?',
        type: 'multiple-choice' as const,
        options: ['Restrictive disease', 'Obstructive disease', 'Normal spirometry', 'Neuromuscular weakness'],
        correctAnswer: 1,
        explanation: 'Decreased FEV1/FVC ratio (<0.7) indicates obstructive lung disease like COPD.',
        difficulty: 'medium' as const,
        topic: 'Pulmonary Function Tests',
        learningObjective: 'Interpret spirometry results'
      },
      {
        id: 'resp-med-2',
        question: 'A patient presents with sudden onset dyspnea and pleuritic chest pain. CXR shows absence of lung markings in the right upper lobe. What is the most likely diagnosis?',
        type: 'multiple-choice' as const,
        options: ['Pneumonia', 'Pneumothorax', 'Pulmonary embolism', 'Pleural effusion'],
        correctAnswer: 1,
        explanation: 'Sudden dyspnea with absence of lung markings on CXR indicates pneumothorax.',
        difficulty: 'medium' as const,
        topic: 'Pneumothorax',
        learningObjective: 'Recognize pneumothorax presentation and imaging'
      }
    ],
    difficult: [
      {
        id: 'resp-hard-1',
        question: 'Calculate the A-a gradient for a patient breathing room air with PaO2 = 80 mmHg, given PAO2 = 100 mmHg. What does this suggest?',
        type: 'short-answer' as const,
        correctAnswer: 'A-a gradient = 20 mmHg, suggests mild gas exchange impairment',
        explanation: 'A-a gradient = PAO2 - PaO2 = 100 - 80 = 20 mmHg. Normal is <15 mmHg, so this suggests mild impairment.',
        difficulty: 'difficult' as const,
        topic: 'Gas Exchange',
        learningObjective: 'Calculate and interpret A-a gradient'
      }
    ]
  },
  renal: {
    easy: [
      {
        id: 'renal-easy-1',
        question: 'Which part of the nephron is primarily responsible for filtration?',
        type: 'multiple-choice' as const,
        options: ['Proximal tubule', 'Loop of Henle', 'Glomerulus', 'Distal tubule'],
        correctAnswer: 2,
        explanation: 'The glomerulus is the site of filtration in the nephron.',
        difficulty: 'easy' as const,
        topic: 'Renal Anatomy',
        learningObjective: 'Identify nephron components and functions'
      }
    ],
    medium: [
      {
        id: 'renal-med-1',
        question: 'A patient has proteinuria, hypoalbuminemia, and edema. What syndrome is this?',
        type: 'multiple-choice' as const,
        options: ['Nephritic syndrome', 'Nephrotic syndrome', 'Acute tubular necrosis', 'Chronic kidney disease'],
        correctAnswer: 1,
        explanation: 'The triad of proteinuria, hypoalbuminemia, and edema defines nephrotic syndrome.',
        difficulty: 'medium' as const,
        topic: 'Glomerular Disease',
        learningObjective: 'Distinguish nephritic vs nephrotic syndromes'
      }
    ],
    difficult: [
      {
        id: 'renal-hard-1',
        question: 'Calculate GFR using creatinine clearance: Urine creatinine = 120 mg/dL, Serum creatinine = 1.2 mg/dL, Urine flow = 1.5 mL/min.',
        type: 'short-answer' as const,
        correctAnswer: 'GFR = 150 mL/min',
        explanation: 'GFR = (Urine creatinine × Urine flow) / Serum creatinine = (120 × 1.5) / 1.2 = 150 mL/min',
        difficulty: 'difficult' as const,
        topic: 'Renal Function Assessment',
        learningObjective: 'Calculate GFR and interpret results'
      }
    ]
  }
};

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