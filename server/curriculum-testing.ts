import OpenAI from "openai";

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
  difficulty: 'easy' | 'medium' | 'difficult';
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
export const medicalTopicTestBanks: Record<string, Record<string, TestQuestion[]>> = {
  cardiovascular: {
    easy: [
      {
        id: 'cv-easy-1',
        question: 'What is the normal resting heart rate range for adults?',
        type: 'multiple-choice',
        options: ['40-60 bpm', '60-100 bpm', '100-120 bpm', '120-150 bpm'],
        correctAnswer: 1,
        explanation: 'The normal resting heart rate for adults is 60-100 beats per minute.',
        difficulty: 'easy',
        topic: 'Cardiovascular Physiology',
        learningObjective: 'Identify normal cardiac vital signs'
      },
      {
        id: 'cv-easy-2',
        question: 'Which chamber of the heart pumps blood to the systemic circulation?',
        type: 'multiple-choice',
        options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
        correctAnswer: 3,
        explanation: 'The left ventricle pumps oxygenated blood to the systemic circulation.',
        difficulty: 'easy',
        topic: 'Cardiac Anatomy',
        learningObjective: 'Identify heart chamber functions'
      },
      {
        id: 'cv-easy-3',
        question: 'What does systolic blood pressure represent?',
        type: 'multiple-choice',
        options: ['Pressure during ventricular filling', 'Pressure during ventricular contraction', 'Pressure in the atria', 'Pressure in the veins'],
        correctAnswer: 1,
        explanation: 'Systolic blood pressure represents the pressure in arteries during ventricular contraction.',
        difficulty: 'easy',
        topic: 'Blood Pressure',
        learningObjective: 'Understand blood pressure components'
      }
    ],
    medium: [
      {
        id: 'cv-med-1',
        question: 'A patient presents with chest pain and ST-elevation on ECG leads II, III, and aVF. Which coronary artery is most likely occluded?',
        type: 'multiple-choice',
        options: ['Left anterior descending', 'Right coronary artery', 'Left circumflex', 'Left main'],
        correctAnswer: 1,
        explanation: 'ST-elevation in leads II, III, and aVF indicates an inferior wall MI, typically caused by RCA occlusion.',
        difficulty: 'medium',
        topic: 'Myocardial Infarction',
        learningObjective: 'Correlate ECG findings with coronary anatomy'
      },
      {
        id: 'cv-med-2',
        question: 'A patient has heart failure with reduced ejection fraction. Which medication class is first-line therapy?',
        type: 'multiple-choice',
        options: ['ACE inhibitors', 'Calcium channel blockers', 'Beta-blockers', 'Diuretics'],
        correctAnswer: 0,
        explanation: 'ACE inhibitors are first-line therapy for HFrEF, providing mortality benefit.',
        difficulty: 'medium',
        topic: 'Heart Failure Management',
        learningObjective: 'Select appropriate heart failure therapies'
      }
    ],
    difficult: [
      {
        id: 'cv-hard-1',
        question: 'Calculate the cardiac output for a patient with stroke volume of 70mL and heart rate of 80 bpm, then determine the ejection fraction if end-diastolic volume is 140mL.',
        type: 'short-answer',
        correctAnswer: 'CO = 5.6 L/min, EF = 50%',
        explanation: 'CO = SV × HR = 70mL × 80 = 5600mL/min = 5.6L/min. EF = SV/EDV = 70/140 = 0.5 = 50%',
        difficulty: 'difficult',
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
        type: 'multiple-choice',
        options: ['Intercostal muscles', 'Diaphragm', 'Accessory muscles', 'Abdominal muscles'],
        correctAnswer: 1,
        explanation: 'The diaphragm is the primary muscle responsible for inspiration.',
        difficulty: 'easy',
        topic: 'Respiratory Mechanics',
        learningObjective: 'Identify muscles of respiration'
      },
      {
        id: 'resp-easy-2',
        question: 'What is the normal tidal volume for an average adult?',
        type: 'multiple-choice',
        options: ['250 mL', '500 mL', '750 mL', '1000 mL'],
        correctAnswer: 1,
        explanation: 'Normal tidal volume is approximately 500 mL (about 7 mL/kg).',
        difficulty: 'easy',
        topic: 'Lung Volumes',
        learningObjective: 'Know normal respiratory volumes'
      }
    ],
    medium: [
      {
        id: 'resp-med-1',
        question: 'A patient with COPD shows decreased FEV1/FVC ratio. What does this indicate?',
        type: 'multiple-choice',
        options: ['Restrictive disease', 'Obstructive disease', 'Normal spirometry', 'Neuromuscular weakness'],
        correctAnswer: 1,
        explanation: 'Decreased FEV1/FVC ratio (<0.7) indicates obstructive lung disease like COPD.',
        difficulty: 'medium',
        topic: 'Pulmonary Function Tests',
        learningObjective: 'Interpret spirometry results'
      }
    ],
    difficult: [
      {
        id: 'resp-hard-1',
        question: 'Calculate the A-a gradient for a patient breathing room air with PaO2 = 80 mmHg, given PAO2 = 100 mmHg. What does this suggest?',
        type: 'short-answer',
        correctAnswer: 'A-a gradient = 20 mmHg, suggests mild gas exchange impairment',
        explanation: 'A-a gradient = PAO2 - PaO2 = 100 - 80 = 20 mmHg. Normal is <15 mmHg, so this suggests mild impairment.',
        difficulty: 'difficult',
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
        type: 'multiple-choice',
        options: ['Proximal tubule', 'Loop of Henle', 'Glomerulus', 'Distal tubule'],
        correctAnswer: 2,
        explanation: 'The glomerulus is the site of filtration in the nephron.',
        difficulty: 'easy',
        topic: 'Renal Anatomy',
        learningObjective: 'Identify nephron components and functions'
      }
    ],
    medium: [
      {
        id: 'renal-med-1',
        question: 'A patient has proteinuria, hypoalbuminemia, and edema. What syndrome is this?',
        type: 'multiple-choice',
        options: ['Nephritic syndrome', 'Nephrotic syndrome', 'Acute tubular necrosis', 'Chronic kidney disease'],
        correctAnswer: 1,
        explanation: 'The triad of proteinuria, hypoalbuminemia, and edema defines nephrotic syndrome.',
        difficulty: 'medium',
        topic: 'Glomerular Disease',
        learningObjective: 'Distinguish nephritic vs nephrotic syndromes'
      }
    ],
    difficult: [
      {
        id: 'renal-hard-1',
        question: 'Calculate GFR using creatinine clearance: Urine creatinine = 120 mg/dL, Serum creatinine = 1.2 mg/dL, Urine flow = 1.5 mL/min.',
        type: 'short-answer',
        correctAnswer: 'GFR = 150 mL/min',
        explanation: 'GFR = (Urine creatinine × Urine flow) / Serum creatinine = (120 × 1.5) / 1.2 = 150 mL/min',
        difficulty: 'difficult',
        topic: 'Renal Function Assessment',
        learningObjective: 'Calculate GFR and interpret results'
      }
    ]
  },
  endocrine: {
    easy: [
      {
        id: 'endo-easy-1',
        question: 'Which gland is known as the "master gland"?',
        type: 'multiple-choice',
        options: ['Thyroid', 'Pituitary', 'Adrenal', 'Pancreas'],
        correctAnswer: 1,
        explanation: 'The pituitary gland is called the master gland because it controls other endocrine glands.',
        difficulty: 'easy',
        topic: 'Endocrine Overview',
        learningObjective: 'Identify major endocrine glands and functions'
      }
    ],
    medium: [
      {
        id: 'endo-med-1',
        question: 'A patient presents with polyuria, polydipsia, and blood glucose of 300 mg/dL. What is the most likely diagnosis?',
        type: 'multiple-choice',
        options: ['Type 1 diabetes', 'Type 2 diabetes', 'Diabetes insipidus', 'Hyperthyroidism'],
        correctAnswer: 0,
        explanation: 'Classic triad of polyuria, polydipsia, and hyperglycemia suggests diabetes mellitus, likely Type 1 with acute presentation.',
        difficulty: 'medium',
        topic: 'Diabetes',
        learningObjective: 'Recognize diabetes mellitus presentation'
      }
    ],
    difficult: [
      {
        id: 'endo-hard-1',
        question: 'Calculate insulin requirements for DKA treatment: Patient weighs 70kg with glucose 400mg/dL and ketones present.',
        type: 'short-answer',
        correctAnswer: 'Initial: 0.1 units/kg/hr = 7 units/hr insulin infusion',
        explanation: 'DKA treatment requires 0.1 units/kg/hr insulin infusion initially, with glucose and electrolyte monitoring.',
        difficulty: 'difficult',
        topic: 'DKA Management',
        learningObjective: 'Calculate insulin dosing for DKA'
      }
    ]
  },
  gastrointestinal: {
    easy: [
      {
        id: 'gi-easy-1',
        question: 'Which organ produces bile?',
        type: 'multiple-choice',
        options: ['Pancreas', 'Gallbladder', 'Liver', 'Small intestine'],
        correctAnswer: 2,
        explanation: 'The liver produces bile, which is stored in the gallbladder.',
        difficulty: 'easy',
        topic: 'GI Anatomy',
        learningObjective: 'Identify GI organ functions'
      }
    ],
    medium: [
      {
        id: 'gi-med-1',
        question: 'A patient has epigastric pain that improves with eating. What is the most likely diagnosis?',
        type: 'multiple-choice',
        options: ['Gastric ulcer', 'Duodenal ulcer', 'GERD', 'Pancreatitis'],
        correctAnswer: 1,
        explanation: 'Duodenal ulcer pain typically improves with eating, unlike gastric ulcer pain which worsens.',
        difficulty: 'medium',
        topic: 'Peptic Ulcer Disease',
        learningObjective: 'Differentiate ulcer types by presentation'
      }
    ],
    difficult: [
      {
        id: 'gi-hard-1',
        question: 'Calculate the Child-Pugh score for a patient with bilirubin 3.0 mg/dL, albumin 2.8 g/dL, PT prolonged by 6 seconds, ascites present, and hepatic encephalopathy grade 2.',
        type: 'short-answer',
        correctAnswer: 'Child-Pugh Class B (7-9 points)',
        explanation: 'Bilirubin 3.0 (2 pts) + albumin 2.8 (2 pts) + PT +6s (2 pts) + ascites (2 pts) + encephalopathy grade 2 (2 pts) = 10 points = Class C',
        difficulty: 'difficult',
        topic: 'Liver Function Assessment',
        learningObjective: 'Calculate Child-Pugh score'
      }
    ]
  },
  nervous: {
    easy: [
      {
        id: 'neuro-easy-1',
        question: 'Which lobe of the brain is primarily responsible for motor function?',
        type: 'multiple-choice',
        options: ['Frontal', 'Parietal', 'Temporal', 'Occipital'],
        correctAnswer: 0,
        explanation: 'The frontal lobe contains the primary motor cortex responsible for voluntary movement.',
        difficulty: 'easy',
        topic: 'Brain Anatomy',
        learningObjective: 'Identify brain lobe functions'
      }
    ],
    medium: [
      {
        id: 'neuro-med-1',
        question: 'A patient has sudden onset right-sided weakness and aphasia. Which artery is most likely affected?',
        type: 'multiple-choice',
        options: ['Left MCA', 'Right MCA', 'Left PCA', 'Right PCA'],
        correctAnswer: 0,
        explanation: 'Left MCA stroke causes right-sided weakness and aphasia (language centers in left hemisphere).',
        difficulty: 'medium',
        topic: 'Stroke Syndromes',
        learningObjective: 'Correlate stroke symptoms with vascular territories'
      }
    ],
    difficult: [
      {
        id: 'neuro-hard-1',
        question: 'Calculate cerebral perfusion pressure (CPP) for a patient with mean arterial pressure of 90 mmHg and intracranial pressure of 25 mmHg. Is this adequate?',
        type: 'short-answer',
        correctAnswer: 'CPP = 65 mmHg, adequate (>60 mmHg)',
        explanation: 'CPP = MAP - ICP = 90 - 25 = 65 mmHg. Normal CPP is >60 mmHg, so this is adequate.',
        difficulty: 'difficult',
        topic: 'Intracranial Pressure',
        learningObjective: 'Calculate and interpret CPP'
      }
    ]
  },
  immunology: {
    easy: [
      {
        id: 'immuno-easy-1',
        question: 'Which cells are responsible for antibody production?',
        type: 'multiple-choice',
        options: ['T cells', 'B cells', 'NK cells', 'Macrophages'],
        correctAnswer: 1,
        explanation: 'B cells differentiate into plasma cells that produce antibodies.',
        difficulty: 'easy',
        topic: 'Adaptive Immunity',
        learningObjective: 'Identify functions of immune cells'
      }
    ],
    medium: [
      {
        id: 'immuno-med-1',
        question: 'A patient develops hives and swelling after eating peanuts. What type of hypersensitivity is this?',
        type: 'multiple-choice',
        options: ['Type I', 'Type II', 'Type III', 'Type IV'],
        correctAnswer: 0,
        explanation: 'Immediate allergic reactions with hives are Type I (IgE-mediated) hypersensitivity.',
        difficulty: 'medium',
        topic: 'Hypersensitivity',
        learningObjective: 'Classify hypersensitivity reactions'
      }
    ],
    difficult: [
      {
        id: 'immuno-hard-1',
        question: 'Explain the mechanism of molecular mimicry in autoimmune diseases with specific example.',
        type: 'short-answer',
        correctAnswer: 'Cross-reactivity between pathogen and self-antigens, e.g., rheumatic fever after strep infection',
        explanation: 'Molecular mimicry occurs when pathogen antigens resemble self-antigens, leading to autoimmune responses.',
        difficulty: 'difficult',
        topic: 'Autoimmunity',
        learningObjective: 'Explain mechanisms of autoimmune disease development'
      }
    ]
  },
  microbiology: {
    easy: [
      {
        id: 'micro-easy-1',
        question: 'What color do Gram-positive bacteria appear after Gram staining?',
        type: 'multiple-choice',
        options: ['Pink/Red', 'Purple/Blue', 'Green', 'Yellow'],
        correctAnswer: 1,
        explanation: 'Gram-positive bacteria retain the crystal violet stain and appear purple/blue.',
        difficulty: 'easy',
        topic: 'Bacterial Classification',
        learningObjective: 'Understand Gram staining principles'
      }
    ],
    medium: [
      {
        id: 'micro-med-1',
        question: 'A patient has pneumonia with rusty-colored sputum. Gram stain shows Gram-positive diplococci. What is the most likely organism?',
        type: 'multiple-choice',
        options: ['Streptococcus pneumoniae', 'Staphylococcus aureus', 'Haemophilus influenzae', 'Klebsiella pneumoniae'],
        correctAnswer: 0,
        explanation: 'S. pneumoniae classically presents with rusty sputum and appears as Gram-positive diplococci.',
        difficulty: 'medium',
        topic: 'Respiratory Infections',
        learningObjective: 'Correlate clinical and lab findings with pathogens'
      }
    ],
    difficult: [
      {
        id: 'micro-hard-1',
        question: 'Design an antibiotic regimen for MRSA pneumonia in a patient with penicillin allergy.',
        type: 'short-answer',
        correctAnswer: 'Vancomycin or linezolid, avoid beta-lactams',
        explanation: 'MRSA requires vancomycin or linezolid. Avoid all beta-lactams in penicillin-allergic patients.',
        difficulty: 'difficult',
        topic: 'Antibiotic Therapy',
        learningObjective: 'Design appropriate antibiotic regimens'
      }
    ]
  },
  biochemistry: {
    easy: [
      {
        id: 'biochem-easy-1',
        question: 'Which molecule stores energy in cells?',
        type: 'multiple-choice',
        options: ['ADP', 'ATP', 'AMP', 'NAD+'],
        correctAnswer: 1,
        explanation: 'ATP (adenosine triphosphate) is the primary energy storage molecule in cells.',
        difficulty: 'easy',
        topic: 'Energy Metabolism',
        learningObjective: 'Identify energy-storing molecules'
      }
    ],
    medium: [
      {
        id: 'biochem-med-1',
        question: 'A patient has elevated lactate levels after exercise. What metabolic pathway is being used?',
        type: 'multiple-choice',
        options: ['Aerobic respiration', 'Anaerobic glycolysis', 'Gluconeogenesis', 'Fatty acid oxidation'],
        correctAnswer: 1,
        explanation: 'Elevated lactate indicates anaerobic glycolysis is occurring due to insufficient oxygen.',
        difficulty: 'medium',
        topic: 'Glycolysis',
        learningObjective: 'Understand metabolic pathway regulation'
      }
    ],
    difficult: [
      {
        id: 'biochem-hard-1',
        question: 'Calculate net ATP yield from complete oxidation of one glucose molecule through glycolysis and TCA cycle.',
        type: 'short-answer',
        correctAnswer: '30-32 ATP molecules',
        explanation: 'Glycolysis yields 2 ATP, TCA cycle yields 2 ATP, electron transport yields ~26-28 ATP, total ~30-32 ATP.',
        difficulty: 'difficult',
        topic: 'ATP Calculation',
        learningObjective: 'Calculate energy yields from metabolic pathways'
      }
    ]
  },
  pharmacology: {
    easy: [
      {
        id: 'pharm-easy-1',
        question: 'What does ADME stand for in pharmacology?',
        type: 'multiple-choice',
        options: ['Absorption, Distribution, Metabolism, Excretion', 'Action, Dose, Mechanism, Effect', 'Administration, Delivery, Modification, Elimination', 'Affinity, Duration, Magnitude, Efficacy'],
        correctAnswer: 0,
        explanation: 'ADME represents the four main pharmacokinetic processes: Absorption, Distribution, Metabolism, Excretion.',
        difficulty: 'easy',
        topic: 'Pharmacokinetics',
        learningObjective: 'Define basic pharmacokinetic principles'
      }
    ],
    medium: [
      {
        id: 'pharm-med-1',
        question: 'A patient on warfarin starts taking a CYP450 inducer. What happens to warfarin levels?',
        type: 'multiple-choice',
        options: ['Increase', 'Decrease', 'No change', 'Unpredictable'],
        correctAnswer: 1,
        explanation: 'CYP450 inducers increase warfarin metabolism, decreasing warfarin levels and anticoagulation effect.',
        difficulty: 'medium',
        topic: 'Drug Interactions',
        learningObjective: 'Predict drug interaction effects'
      }
    ],
    difficult: [
      {
        id: 'pharm-hard-1',
        question: 'Calculate loading dose for digoxin: Target level 2 ng/mL, Vd = 7 L/kg, patient weighs 70 kg, bioavailability = 0.7.',
        type: 'short-answer',
        correctAnswer: 'Loading dose = 1400 mcg',
        explanation: 'Loading dose = (Target × Vd × Weight) / Bioavailability = (2 × 7 × 70) / 0.7 = 1400 mcg',
        difficulty: 'difficult',
        topic: 'Dosing Calculations',
        learningObjective: 'Calculate appropriate drug dosing'
      }
    ]
  }
};

// Function to generate tests from medical topic test banks
export function generateTopicTest(topic: string, difficulty: 'easy' | 'medium' | 'difficult', numQuestions: number = 5): GeneratedTest | null {
  const normalizedTopic = topic.toLowerCase();
  
  // Map common topic variations to test bank keys
  const topicMap: Record<string, string> = {
    'cardio': 'cardiovascular',
    'cardiovascular': 'cardiovascular',
    'heart': 'cardiovascular',
    'respiratory': 'respiratory',
    'pulmonary': 'respiratory',
    'lung': 'respiratory',
    'renal': 'renal',
    'kidney': 'renal',
    'nephrology': 'renal',
    'endocrine': 'endocrine',
    'hormone': 'endocrine',
    'diabetes': 'endocrine',
    'gastrointestinal': 'gastrointestinal',
    'gi': 'gastrointestinal',
    'digestive': 'gastrointestinal',
    'liver': 'gastrointestinal',
    'nervous': 'nervous',
    'neuro': 'nervous',
    'brain': 'nervous',
    'cns': 'nervous',
    'immunology': 'immunology',
    'immune': 'immunology',
    'antibody': 'immunology',
    'microbiology': 'microbiology',
    'micro': 'microbiology',
    'bacteria': 'microbiology',
    'virus': 'microbiology',
    'biochemistry': 'biochemistry',
    'metabolism': 'biochemistry',
    'enzyme': 'biochemistry',
    'pharmacology': 'pharmacology',
    'drug': 'pharmacology',
    'medication': 'pharmacology'
  };

  const mappedTopic = topicMap[normalizedTopic];
  if (!mappedTopic || !medicalTopicTestBanks[mappedTopic]) {
    return null;
  }

  const topicBank = medicalTopicTestBanks[mappedTopic];
  const difficultyQuestions = topicBank[difficulty];
  
  if (!difficultyQuestions || difficultyQuestions.length === 0) {
    return null;
  }

  // Shuffle and select questions
  const shuffled = [...difficultyQuestions].sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

  // If we need more questions, fill from other difficulties
  if (selectedQuestions.length < numQuestions) {
    const allDifficulties = ['easy', 'medium', 'difficult'] as const;
    for (const diff of allDifficulties) {
      if (diff !== difficulty && selectedQuestions.length < numQuestions) {
        const additionalQuestions = topicBank[diff] || [];
        const shuffledAdditional = [...additionalQuestions].sort(() => Math.random() - 0.5);
        const needed = numQuestions - selectedQuestions.length;
        selectedQuestions.push(...shuffledAdditional.slice(0, needed));
      }
    }
  }

  return {
    title: `${mappedTopic.charAt(0).toUpperCase() + mappedTopic.slice(1)} Assessment (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level)`,
    phase: 'Medical Education',
    topic: mappedTopic,
    difficulty,
    totalQuestions: selectedQuestions.length,
    questions: selectedQuestions,
    timeAllowed: selectedQuestions.length * 2, // 2 minutes per question
    passingScore: 70
  };
}

// Curriculum content for each phase
export const curriculumContent = {
  "Foundations": [
    {
      week: 1,
      title: "Introduction to Medicine and Professional Identity Formation",
      topics: ["Medical professionalism", "Ethics", "Communication skills", "Healthcare systems"],
      learningObjectives: [
        "Develop understanding of medical professionalism",
        "Apply basic ethical principles to healthcare scenarios",
        "Demonstrate effective communication with patients and colleagues"
      ],
      keyTerms: ["Professionalism", "Bioethics", "Patient-centered care", "Healthcare delivery"],
      assessmentFocus: ["Professional behavior", "Ethical reasoning", "Communication skills"]
    }
  ],
  "Pre-clerkship": [
    {
      week: 1,
      title: "Cardiovascular System - Week 1",
      topics: ["Cardiac anatomy", "Cardiac physiology", "ECG basics", "Blood pressure regulation"],
      learningObjectives: [
        "Describe cardiac anatomy and physiology",
        "Interpret basic ECG rhythms", 
        "Explain blood pressure regulation mechanisms"
      ],
      keyTerms: ["Cardiac cycle", "Conduction system", "Preload", "Afterload"],
      assessmentFocus: ["Cardiac anatomy", "Physiological mechanisms", "ECG interpretation"]
    }
  ],
  "MCE": [
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
    }
  ]
};

export class CurriculumTestGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "demo_key"
    });
  }

  async generateTest(phase: string, week: number, options: {
    numQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    focus?: string[];
  } = {}): Promise<GeneratedTest> {
    const { numQuestions = 10, difficulty = 'mixed', focus = [] } = options;
    
    // Get curriculum content for the phase and week
    const phaseContent = curriculumContent[phase as keyof typeof curriculumContent] || [];
    const weekContent = phaseContent.find(w => w.week === week);
    
    if (!weekContent) {
      throw new Error(`No curriculum content found for ${phase} week ${week}`);
    }

    try {
      const prompt = this.buildTestPrompt(weekContent, numQuestions, difficulty, focus);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert medical educator creating high-quality assessment questions for medical students. Create questions that test both knowledge and clinical application."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return this.parseTestResponse(content, weekContent, numQuestions);
      
    } catch (error) {
      console.error('Error generating test with OpenAI:', error);
      
      // Fallback to basic test generation
      return this.generateFallbackTest(weekContent, numQuestions, difficulty);
    }
  }

  private buildTestPrompt(weekContent: CurriculumWeek, numQuestions: number, difficulty: string, focus: string[]): string {
    return `Create a medical education assessment with ${numQuestions} questions for:

**Course**: ${weekContent.title}
**Topics**: ${weekContent.topics.join(', ')}
**Learning Objectives**: ${weekContent.learningObjectives.join('; ')}
**Key Terms**: ${weekContent.keyTerms.join(', ')}
**Assessment Focus**: ${weekContent.assessmentFocus.join(', ')}
**Difficulty**: ${difficulty}
${focus.length > 0 ? `**Special Focus**: ${focus.join(', ')}` : ''}

Requirements:
1. Create exactly ${numQuestions} questions
2. Mix question types: multiple choice, true/false, and short answer
3. Each question should include:
   - Clear, clinically relevant question
   - For multiple choice: 4 options with one correct answer
   - Detailed explanation of the correct answer
   - Learning objective being tested
4. Questions should test both knowledge and clinical application
5. Difficulty should be appropriate for medical students

Format your response as a JSON object with this structure:
{
  "title": "Assessment Title",
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "type": "multiple-choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation",
      "difficulty": "medium",
      "topic": "Specific topic",
      "learningObjective": "What this tests"
    }
  ]
}`;
  }

  private parseTestResponse(content: string, weekContent: CurriculumWeek, numQuestions: number): GeneratedTest {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsedData.title || weekContent.title,
        phase: 'Medical Education',
        week: weekContent.week,
        totalQuestions: parsedData.questions?.length || numQuestions,
        questions: parsedData.questions || [],
        timeAllowed: numQuestions * 2, // 2 minutes per question
        passingScore: 70
      };
      
    } catch (error) {
      console.error('Error parsing test response:', error);
      throw new Error('Failed to parse AI response into test format');
    }
  }

  private generateFallbackTest(weekContent: CurriculumWeek, numQuestions: number, difficulty: string): GeneratedTest {
    const questions: TestQuestion[] = [];
    
    for (let i = 0; i < numQuestions; i++) {
      const topic = weekContent.topics[i % weekContent.topics.length];
      const objective = weekContent.learningObjectives[i % weekContent.learningObjectives.length];
      
      questions.push({
        id: `fallback-${i + 1}`,
        question: `Based on ${topic}, explain the key concepts related to ${objective.toLowerCase()}.`,
        type: 'short-answer',
        correctAnswer: `Key concepts for ${topic} include the fundamental principles covered in ${weekContent.title}.`,
        explanation: `This question tests understanding of ${topic} as covered in the learning objectives.`,
        difficulty: difficulty === 'mixed' ? ['easy', 'medium', 'difficult'][i % 3] as any : difficulty as any,
        topic: topic,
        learningObjective: objective
      });
    }

    return {
      title: `${weekContent.title} - Assessment`,
      phase: 'Medical Education',
      week: weekContent.week,
      totalQuestions: questions.length,
      questions: questions,
      timeAllowed: numQuestions * 2,
      passingScore: 70
    };
  }
}

export const testGenerator = new CurriculumTestGenerator();