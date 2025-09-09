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
import { testGenerator, generateTopicTest } from "./curriculum-testing";

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
  try {
    const testGenerationResult = await handleTestGenerationRequest(message);
    if (testGenerationResult) {
      return testGenerationResult;
    }
  } catch (error) {
    console.log("Test generation failed, providing fallback response");
    // Check if user is asking for a test/quiz
    if (message.toLowerCase().includes('test') || message.toLowerCase().includes('quiz')) {
      return `I'd love to help you create a test for that topic! However, I'm experiencing some technical difficulties with the test generation system right now.

In the meantime, I can help you with:
• **Study guidance** for your topic
• **Key concepts** to focus on  
• **Learning resources** and materials
• **Practice questions** manually created

What specific topic would you like to study? I can provide comprehensive information to help you prepare.`;
    }
  }

  // Check for simple greetings or general help requests first
  const lowerMessage = message.toLowerCase().trim();
  const isSimpleGreeting = /^(hello|hi|hey|good morning|good afternoon|good evening)(\s|$|!|\?|\.)/i.test(lowerMessage);
  const isGeneralHelp = /^(can you help|help me|how can you help|what can you do|how do you work)(\s|$|!|\?|\.)/i.test(lowerMessage);
  
  if (isSimpleGreeting || isGeneralHelp) {
    return `Hello! I'm the CHM AI Assistant, here to help you with questions about the College of Human Medicine curriculum, learning societies, academic resources, and medical education.

I can help you with:
• **Curriculum Information**: M1, MCE, and LCE phase details
• **Learning Societies**: Jane Adams, John Dewey, Justin Morrill, and Dale Hale Williams societies
• **Academic Resources**: Study materials, board exam prep, research opportunities
• **Student Support**: Academic achievement services, wellness resources
• **Quick Tests**: Generate practice quizzes for any curriculum topic

What would you like to know about CHM or your medical education?`;
  }

  // Build context from recent conversation history with better coherence
  const recentMessages = conversationHistory.slice(-6); // Last 6 messages for better focus
  const conversationContext = recentMessages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');
  
  // For brief questions, use conversation context to understand intent
  const isBriefQuestion = message.split(' ').length <= 5;
  let enhancedMessage = message;
  
  if (isBriefQuestion && recentMessages.length > 0) {
    // Extract key topics and context from recent conversation
    const lastAssistantMessage = recentMessages.filter(msg => msg.role === 'assistant').pop();
    const lastUserMessage = recentMessages.filter(msg => msg.role === 'user').pop();
    
    // Check for common brief follow-up patterns
    const briefPatterns = [
      /harder/i, /easier/i, /more/i, /another/i, /different/i, 
      /next/i, /continue/i, /again/i, /explain/i, /tell me more/i
    ];
    
    const isBriefFollowUp = briefPatterns.some(pattern => pattern.test(message));
    
    console.log('Brief question detection:', {
      message,
      isBriefQuestion,
      isBriefFollowUp,
      lastUserMessage: lastUserMessage?.content,
      lastAssistantMessage: lastAssistantMessage?.content?.substring(0, 100)
    });
    
    if ((isBriefFollowUp || isBriefQuestion) && lastAssistantMessage && lastUserMessage) {
      // Extract key topics from previous conversation
      const topicMatches = lastUserMessage.content.match(/(M1|M2|M3|MCE|LCE|week \d+|emergency|cardiology|neurology|surgery|pediatrics|psychiatry|medicine|quiz|test|exam|anatomy|physiology|pathology)/gi);
      const topics = topicMatches ? topicMatches.join(', ') : 'the previous topic';
      
      // Special handling for test/quiz requests
      if (message.toLowerCase().includes('harder') && (message.toLowerCase().includes('test') || message.toLowerCase().includes('quiz') || lastUserMessage.content.toLowerCase().includes('test') || lastUserMessage.content.toLowerCase().includes('quiz'))) {
        enhancedMessage = `The user previously asked: "${lastUserMessage.content}"

Now they want a "harder test" or "harder quiz" about the same topic: ${topics}

Please generate a more challenging test/quiz on ${topics} with harder difficulty level than what was previously provided. Make it more complex and detailed.`;
      } else {
        enhancedMessage = `CONTEXT: The user just asked "${lastUserMessage.content}" and I provided information about ${topics}. 

CURRENT REQUEST: "${message}"

This is a brief follow-up request. Based on the context:
- If they want "harder quiz/questions/test" → Generate a harder quiz on ${topics}
- If they want "easier quiz/questions/test" → Generate an easier quiz on ${topics} 
- If they want "more questions" → Generate more questions about ${topics}
- If they want "another quiz" → Generate a different quiz about ${topics}
- If they want "explain more" → Provide more detailed explanation about ${topics}

Please respond appropriately based on their brief request and the conversation context.`;
      }
    }
  }
  
  // Skip knowledge base search temporarily - go directly to AI for better alignment
  // This ensures responses match the user's actual questions

  // Fallback to AI-generated response with knowledge base context
  const systemPrompt = `You are the CHM AI Assistant for Michigan State University College of Human Medicine. Your primary goal is to provide direct, specific answers to student questions about the CHM Shared Discovery Curriculum.

CRITICAL RESPONSE GUIDELINES:
1. ALWAYS directly answer the specific question asked
2. Read the question carefully and focus on exactly what the student wants to know
3. Provide specific, actionable information relevant to their question
4. Avoid generic overviews unless specifically requested
5. If you don't have specific information, say so clearly and suggest appropriate resources
6. IMPORTANT: If the user provides context about previous requests and asks for "harder", "easier", "more" etc., USE THAT CONTEXT to generate appropriate follow-up content

CHM SPECIFIC INFORMATION:
Learning Societies:
- Jane Adams Society (36 students): Social justice and community health focus
- John Dewey Society (23 students): Problem-based learning emphasis  
- Justin Morrill Society (62 students): Land-grant university mission
- Dale Hale Williams Society (35 students): Pioneering surgeon legacy

Curriculum Phases:
- M1: Foundational medical sciences, anatomy, physiology, pathology, basic clinical skills
- MCE: Clinical rotations in Internal Medicine, Surgery, Pediatrics, Psychiatry, OB/GYN, Family Medicine
- LCE: Advanced clerkships, electives, and specialization preparation (years 3-4)

Available Resources:
- Medical eBooks and clinical references
- USMLE Step 1 & 2 preparation materials
- Clinical skills simulation training
- Research opportunities and global electives
- Academic achievement support services

RESPONSE APPROACH:
- Identify what specific information the student is requesting
- Provide a direct, focused answer to their exact question
- Include relevant CHM-specific details when helpful
- Suggest follow-up resources only if directly relevant
- Keep responses concise and targeted

Remember: Match your response directly to what the student is asking about. Don't provide information they didn't request.

CONTEXT HANDLING: If the user's message contains context like "The user previously asked..." and mentions wanting a "harder test" or similar follow-up, generate the appropriate content based on that context. Pay special attention to difficulty adjustments and topic continuity.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
        { role: "user", content: enhancedMessage }
      ],
      max_tokens: 800,
      temperature: 0.4,
    });

    return response.choices[0]?.message?.content || "I apologize, but I'm having trouble generating a response right now. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Enhanced fallback responses based on keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('step 1') || lowerMessage.includes('usmle')) {
      return `I'd love to help you prepare for **USMLE Step 1**! Here's a comprehensive prep guide:

## 📚 **Core Study Areas**
• **Basic Sciences**: Anatomy, Physiology, Pathology, Pharmacology, Microbiology
• **Integrated Systems**: Cardiovascular, Respiratory, Renal, GI, Endocrine, Reproductive
• **Immunology & Pathology**: Disease mechanisms and immune responses

## 🎯 **Essential Study Resources**
• **NBME Practice Exams**: Available through MyMSU portal
• **UWorld Question Bank**: Essential for practice questions and explanations
• **First Aid for USMLE Step 1**: Comprehensive review book
• **Pathoma**: Excellent video series for pathology concepts
• **Sketchy Medical**: Visual mnemonics for microbiology/pharmacology

## 📖 **CHM-Specific Resources**
• Canvas course materials from M1 foundational sciences
• Clinical Skills Center for integrated practice
• Academic Achievement services for personalized study planning
• NBME practice exam access through student services

## ⏰ **Study Timeline Recommendations**
• **6+ months before**: Build strong foundation with M1 materials
• **3-4 months before**: Begin intensive review with First Aid + UWorld
• **1-2 months before**: Focus on practice exams and weak areas
• **Final weeks**: Review high-yield facts and maintain confidence

Would you like me to focus on any specific subject area or study strategy?`;
    }
    
    if (lowerMessage.includes('integrated') || lowerMessage.includes('systems') || lowerMessage.includes('organ system')) {
      return `Here's how to master **Integrated Systems** for USMLE Step 1:

## 🔄 **Systems-Based Learning Approach**
• **Think Integration**: Understand how systems work together, not in isolation
• **Clinical Correlation**: Connect normal function → pathophysiology → clinical presentation
• **Cross-System Connections**: Learn how one system affects others

## 🎯 **Major Integrated Systems for Step 1**

### 🫀 **Cardiovascular System**
• **Key Topics**: Heart physiology, blood pressure regulation, heart failure, arrhythmias
• **Integration**: How CV affects renal, respiratory, endocrine systems
• **Resources**: Costanzo Physiology, First Aid CV chapter

### 🫁 **Respiratory System** 
• **Key Topics**: Gas exchange, ventilation control, acid-base balance
• **Integration**: Links to cardiovascular, renal pH regulation
• **Resources**: Respiratory physiology videos, UWorld pulmonary questions

### 🫘 **Renal System**
• **Key Topics**: Filtration, electrolyte balance, acid-base, blood pressure control
• **Integration**: Major regulator affecting all other systems
• **Resources**: Renal physiology is crucial - focus heavily here

### 🧠 **Endocrine System**
• **Key Topics**: Hormone regulation, feedback loops, diabetes, thyroid
• **Integration**: Controls metabolism, growth, reproduction across systems
• **Resources**: Endocrine pathology high-yield for Step 1

### 🍽️ **Gastrointestinal System**
• **Key Topics**: Digestion, absorption, liver function, GI hormones
• **Integration**: Nutrition affects all systems, liver metabolism central

## 📚 **Study Strategy for Systems Integration**
• **Start with Normal**: Master normal physiology first
• **Add Pathology**: Learn what goes wrong and why
• **Clinical Cases**: Practice integrated thinking with UWorld
• **Concept Maps**: Draw connections between systems

## 🔬 **CHM Integration Resources**
• M1 systems-based curriculum modules
• Case-based learning sessions
• Clinical correlations in each system block
• Integration exercises in Canvas

Focus on understanding **HOW** and **WHY** systems interact - this is key for Step 1 success!`;
    }
    
    if (lowerMessage.includes('cardio') || lowerMessage.includes('cardiovascular') || lowerMessage.includes('heart')) {
      return `Here's your comprehensive **Cardiovascular System** prep guide for USMLE Step 1:

## 🫀 **Core Cardiovascular Topics for Step 1**

### ⚡ **Essential Physiology**
• **Cardiac Cycle**: Systole, diastole, pressure-volume loops
• **Frank-Starling Mechanism**: Preload and cardiac output relationship
• **Blood Pressure Regulation**: Baroreceptors, RAAS, autonomic control
• **Cardiac Output**: CO = HR × SV, factors affecting each
• **Vascular Function**: Resistance, compliance, flow dynamics

### 🔬 **High-Yield Pathology**
• **Heart Failure**: Systolic vs diastolic, compensatory mechanisms
• **Myocardial Infarction**: STEMI vs NSTEMI, complications
• **Arrhythmias**: A-fib, V-fib, heart blocks, mechanisms
• **Valvular Disease**: Stenosis vs regurgitation, murmurs
• **Hypertension**: Primary vs secondary, target organ damage

### 💊 **Pharmacology Focus**
• **ACE Inhibitors/ARBs**: Mechanism, side effects, indications
• **Beta-Blockers**: Selective vs non-selective, contraindications  
• **Diuretics**: Thiazide, loop, K+-sparing mechanisms
• **Calcium Channel Blockers**: DHP vs non-DHP differences
• **Anti-arrhythmics**: Class I-IV mechanisms and uses

## 📚 **Study Strategy**
• **Start with Normal**: Master cardiac cycle and hemodynamics first
• **Pathoma Cardiovascular**: Essential for understanding pathology
• **UWorld Cardio Questions**: Practice clinical application extensively
• **ECG Interpretation**: Learn systematic approach to reading ECGs
• **Murmur Recognition**: Timing, location, radiation patterns

## 🎯 **High-Yield Study Resources**
• **Costanzo Physiology**: Chapter 4 (Cardiovascular)
• **First Aid**: Cardiovascular chapter (very high-yield)
• **Pathoma**: Cardiovascular pathology videos
• **UWorld**: Cardiovascular question bank
• **ECG interpretation guides**: 12-lead ECG systematic approach

## 🔬 **CHM Cardiovascular Resources**
• M1 cardiovascular physiology modules on Canvas
• Cardiac auscultation practice in Clinical Skills Center
• Cardiovascular pathology lab slides and cases
• ECG interpretation workshops

## ⚡ **Must-Know Clinical Correlations**
• **Chest Pain**: MI vs angina vs PE differential
• **Heart Failure**: Symptoms, staging, treatment approach
• **Shock**: Cardiogenic vs distributive vs hypovolemic
• **Murmurs**: Innocent vs pathologic, when to worry

**Key Tip**: Cardiovascular is one of the highest-yield topics for Step 1 - invest significant time here!`;
    }
    
    if (lowerMessage.includes('respiratory') || lowerMessage.includes('pulmonary') || lowerMessage.includes('lung')) {
      return `Here's your **Respiratory System** prep guide for USMLE Step 1:

## 🫁 **Core Respiratory Topics**

### ⚡ **Essential Physiology**
• **Gas Exchange**: Diffusion, ventilation-perfusion matching
• **Mechanics of Breathing**: Compliance, resistance, work of breathing
• **Control of Breathing**: Central and peripheral chemoreceptors
• **Acid-Base Balance**: Respiratory compensation mechanisms
• **Oxygen Transport**: Hemoglobin saturation, oxygen-hemoglobin curve

### 🔬 **High-Yield Pathology**
• **Asthma vs COPD**: Mechanisms, triggers, treatment differences
• **Pneumonia**: Types, pathogens, complications
• **Pulmonary Embolism**: Risk factors, presentation, diagnosis
• **ARDS**: Pathophysiology, management
• **Lung Cancer**: Types, staging, risk factors

### 📚 **Study Resources**
• **Costanzo Physiology**: Respiratory chapters
• **First Aid**: Respiratory system (high-yield)
• **Pathoma**: Respiratory pathology videos
• **UWorld**: Pulmonary questions and explanations

**Focus**: Master gas exchange principles and acid-base balance - frequently tested!`;
    }
    
    if (lowerMessage.includes('renal') || lowerMessage.includes('kidney') || lowerMessage.includes('nephrology')) {
      return `Here's your **Renal System** prep guide for USMLE Step 1:

## 🫘 **Core Renal Topics**

### ⚡ **Essential Physiology**
• **Filtration**: GFR, clearance, filtration fraction
• **Tubular Function**: Reabsorption and secretion mechanisms
• **Acid-Base Regulation**: Bicarbonate handling, compensation
• **Electrolyte Balance**: Na+, K+, Ca2+, PO4- regulation
• **Fluid Balance**: ADH, aldosterone, diuretics

### 🔬 **High-Yield Pathology**
• **Acute Kidney Injury**: Pre-renal, intrinsic, post-renal causes
• **Chronic Kidney Disease**: Stages, complications, management
• **Glomerular Disease**: Nephritic vs nephrotic syndromes
• **Electrolyte Disorders**: Hypo/hypernatremia, hypo/hyperkalemia
• **Acid-Base Disorders**: Metabolic and respiratory acidosis/alkalosis

### 📚 **Study Strategy**
• **Master Normal Function**: Understand filtration and tubular processes
• **Acid-Base**: Critical for Step 1 - practice calculations
• **Pathoma Renal**: Essential for glomerular diseases
• **UWorld**: Practice nephrology questions extensively

**Key Tip**: Renal physiology is foundational for understanding many other systems!`;
    }
    
    if (lowerMessage.includes('endocrine') || lowerMessage.includes('hormone') || lowerMessage.includes('diabetes')) {
      return `Here's your **Endocrine System** prep guide for USMLE Step 1:

## 🧠 **Core Endocrine Topics**

### ⚡ **Essential Physiology**
• **Hypothalamic-Pituitary Axis**: Feedback loops, releasing hormones
• **Thyroid Function**: T3/T4 synthesis, regulation, metabolism
• **Adrenal Function**: Cortisol, aldosterone, catecholamines
• **Pancreatic Hormones**: Insulin, glucagon, glucose regulation
• **Reproductive Hormones**: GnRH, LH, FSH, sex hormones

### 🔬 **High-Yield Pathology**
• **Diabetes**: Type 1 vs Type 2, complications, management
• **Thyroid Disorders**: Hyper/hypothyroidism, thyroid cancer
• **Adrenal Disorders**: Addison's, Cushing's, pheochromocytoma
• **Pituitary Disorders**: Adenomas, diabetes insipidus
• **Reproductive Disorders**: PCOS, infertility, menstrual disorders

### 💊 **Pharmacology**
• **Diabetes Medications**: Insulin types, metformin, sulfonylureas
• **Thyroid Medications**: Levothyroxine, antithyroid drugs
• **Steroid Hormones**: Glucocorticoids, mineralocorticoids

**Focus**: Master feedback loops and diabetes - very high-yield for Step 1!`;
    }
    
    if (lowerMessage.includes('gastrointestinal') || lowerMessage.includes('digestive') || lowerMessage.includes('liver') || lowerMessage.includes('gi')) {
      return `Here's your **Gastrointestinal System** prep guide for USMLE Step 1:

## 🍽️ **Core GI Topics**

### ⚡ **Essential Physiology**
• **Digestion and Absorption**: Carbs, proteins, fats, vitamins
• **GI Hormones**: Gastrin, CCK, secretin, GIP functions
• **Gastric Acid Secretion**: Regulation, phases
• **Hepatic Function**: Metabolism, detoxification, synthesis
• **Bile Acid Metabolism**: Enterohepatic circulation

### 🔬 **High-Yield Pathology**
• **Peptic Ulcer Disease**: H. pylori, NSAIDs, complications
• **Inflammatory Bowel Disease**: Crohn's vs UC differences
• **Liver Disease**: Hepatitis, cirrhosis, liver failure
• **GI Bleeding**: Upper vs lower, causes, management
• **Malabsorption**: Celiac, pancreatic insufficiency

### 💊 **Pharmacology**
• **Acid Suppression**: PPIs, H2 blockers, antacids
• **IBD Treatment**: 5-ASA, steroids, biologics
• **Hepatitis Treatment**: Antivirals, interferons

**Focus**: Master absorption mechanisms and liver function - frequently tested!`;
    }
    
    if (lowerMessage.includes('nervous') || lowerMessage.includes('neuro') || lowerMessage.includes('brain') || lowerMessage.includes('cns')) {
      return `Here's your **Nervous System** prep guide for USMLE Step 1:

## 🧠 **Core Nervous System Topics**

### ⚡ **Essential Neuroanatomy**
• **CNS Organization**: Cerebrum, cerebellum, brainstem, spinal cord
• **Functional Areas**: Motor, sensory, language, memory regions
• **Cranial Nerves**: All 12 nerves, functions, testing
• **Spinal Tracts**: Ascending and descending pathways
• **Blood Supply**: Circle of Willis, vascular territories

### 🔬 **High-Yield Pathology**
• **Stroke**: Ischemic vs hemorrhagic, territories, symptoms
• **Seizures**: Types, mechanisms, antiepileptic drugs
• **Neurodegenerative**: Alzheimer's, Parkinson's, ALS
• **Infections**: Meningitis, encephalitis, brain abscess
• **Tumors**: Primary vs metastatic, types, locations

### 💊 **Neuropharmacology**
• **Antiepileptics**: Mechanisms, side effects, drug interactions
• **Antipsychotics**: Typical vs atypical, side effects
• **Antidepressants**: SSRIs, tricyclics, MAOIs

**Focus**: Neuroanatomy is complex but high-yield - use visual resources!`;
    }
    
    if (lowerMessage.includes('immunology') || lowerMessage.includes('immune') || lowerMessage.includes('antibody')) {
      return `Here's your **Immunology** prep guide for USMLE Step 1:

## 🛡️ **Core Immunology Topics**

### ⚡ **Essential Concepts**
• **Innate Immunity**: Barriers, complement, phagocytes, NK cells
• **Adaptive Immunity**: T cells, B cells, antibodies, memory
• **Antigen Presentation**: MHC I vs MHC II, processing pathways
• **T Cell Subsets**: Th1, Th2, Th17, Treg functions
• **Antibody Classes**: IgG, IgM, IgA, IgE, IgD functions

### 🔬 **High-Yield Pathology**
• **Hypersensitivity**: Types I-IV mechanisms and examples
• **Autoimmune Diseases**: SLE, RA, MS, type 1 diabetes
• **Immunodeficiencies**: Primary vs secondary, presentations
• **Transplant Rejection**: Hyperacute, acute, chronic mechanisms
• **Tumor Immunology**: Immune surveillance, escape mechanisms

### 💊 **Immunopharmacology**
• **Immunosuppressants**: Steroids, calcineurin inhibitors, biologics
• **Monoclonal Antibodies**: Targets and therapeutic uses
• **Vaccines**: Types, mechanisms, schedules

**Focus**: Master hypersensitivity reactions and autoimmune diseases - very testable!`;
    }
    
    if (lowerMessage.includes('microbiology') || lowerMessage.includes('bacteria') || lowerMessage.includes('virus') || lowerMessage.includes('micro')) {
      return `Here's your **Microbiology** prep guide for USMLE Step 1:

## 🦠 **Core Microbiology Topics**

### ⚡ **Bacterial Classification**
• **Gram Staining**: Positive vs negative, cell wall differences
• **Morphology**: Cocci, rods, spirals, arrangements
• **Metabolism**: Aerobic, anaerobic, facultative
• **Virulence Factors**: Toxins, adhesins, capsules
• **Antibiotic Resistance**: Mechanisms, important resistances

### 🔬 **High-Yield Organisms**
• **Gram+ Cocci**: Staph, Strep species and diseases
• **Gram- Rods**: E. coli, Salmonella, Pseudomonas
• **Anaerobes**: C. diff, Bacteroides, gas gangrene
• **Atypicals**: Chlamydia, Mycoplasma, Rickettsia
• **Mycobacteria**: TB, atypical mycobacteria

### 🦠 **Virology Essentials**
• **DNA Viruses**: Herpes family, pox, papilloma
• **RNA Viruses**: Influenza, HIV, hepatitis, corona
• **Viral Replication**: Life cycles, targets for therapy

### 💊 **Antimicrobial Therapy**
• **Cell Wall Inhibitors**: Penicillins, cephalosporins
• **Protein Synthesis**: Aminoglycosides, macrolides
• **Antivirals**: Mechanisms, resistance patterns

**Study Tip**: Use Sketchy Micro for visual mnemonics - very effective for memorization!`;
    }
    
    if (lowerMessage.includes('biochemistry') || lowerMessage.includes('metabolism') || lowerMessage.includes('enzyme')) {
      return `Here's your **Biochemistry** prep guide for USMLE Step 1:

## ⚗️ **Core Biochemistry Topics**

### ⚡ **Metabolism Pathways**
• **Glycolysis**: Steps, regulation, clinical correlations
• **Citric Acid Cycle**: Steps, regulation, anaplerotic reactions
• **Electron Transport**: Complexes, ATP synthesis, inhibitors
• **Gluconeogenesis**: Steps, regulation, substrates
• **Fatty Acid Metabolism**: Beta-oxidation, synthesis

### 🔬 **High-Yield Areas**
• **Enzyme Kinetics**: Michaelis-Menten, competitive inhibition
• **Protein Structure**: Primary-quaternary, folding diseases
• **Genetics**: DNA replication, transcription, translation
• **Vitamins**: Functions, deficiencies, coenzymes
• **Amino Acids**: Essential, metabolic disorders

### 💊 **Clinical Correlations**
• **Metabolic Disorders**: PKU, glycogen storage diseases
• **Drug Mechanisms**: Enzyme inhibitors, antimetabolites
• **Nutritional Diseases**: Vitamin deficiencies, malnutrition

**Focus**: Master glycolysis and TCA cycle - foundation for many other topics!`;
    }
    
    if (lowerMessage.includes('pharmacology') || lowerMessage.includes('drug') || lowerMessage.includes('medication')) {
      return `Here's your **Pharmacology** prep guide for USMLE Step 1:

## 💊 **Core Pharmacology Topics**

### ⚡ **Pharmacokinetics**
• **ADME**: Absorption, distribution, metabolism, excretion
• **Clearance**: Renal, hepatic, total body clearance
• **Half-Life**: Calculation, clinical significance
• **Bioavailability**: First-pass effect, bioequivalence
• **Drug Interactions**: CYP450 enzymes, protein binding

### 🔬 **Pharmacodynamics**
• **Receptor Theory**: Agonists, antagonists, partial agonists
• **Dose-Response**: ED50, LD50, therapeutic index
• **Tolerance**: Mechanisms, clinical implications
• **Side Effects**: On-target vs off-target effects

### 💊 **High-Yield Drug Classes**
• **Cardiovascular**: ACE inhibitors, beta-blockers, diuretics
• **CNS**: Antidepressants, antiepileptics, anesthetics
• **Antimicrobials**: Antibiotics, antivirals, antifungals
• **Endocrine**: Diabetes drugs, thyroid medications
• **Cancer**: Chemotherapy mechanisms, side effects

**Study Strategy**: Focus on mechanisms of action and major side effects!`;
    }
    
    if (lowerMessage.includes('pathology') || lowerMessage.includes('pathophysiology')) {
      return `Here's how to master **Pathology** for USMLE Step 1 and medical school:

## 📚 **Core Pathology Study Approach**
• **Understand Disease Mechanisms**: Focus on "how" and "why" diseases occur
• **Link Structure to Function**: Connect anatomical changes to clinical symptoms
• **Pattern Recognition**: Learn to identify key pathological patterns

## 🎯 **Essential Pathology Resources**
• **Pathoma by Dr. Sattar**: Gold standard video series + textbook
• **Robbins Basic Pathology**: Comprehensive textbook reference
• **First Aid Chapter**: High-yield facts and patterns
• **UWorld Pathology Questions**: Practice application of concepts

## 📖 **Study Strategy**
• **Start with Pathoma**: Watch videos, then read corresponding chapters
• **Focus on High-Yield Topics**: Inflammation, neoplasia, cardiovascular, respiratory
• **Create Visual Associations**: Draw out disease processes and mechanisms
• **Practice Questions Early**: Apply concepts through UWorld and NBME

## 🔬 **CHM-Specific Resources**
• M1 Pathology course materials on Canvas
• Histology lab slides and virtual microscopy
• Clinical correlation sessions
• Academic Achievement tutoring for difficult concepts

## ⚡ **High-Yield Pathology Topics**
• Inflammation and tissue repair
• Neoplasia (benign vs malignant)
• Cardiovascular pathology
• Respiratory pathology
• Renal and GI pathology

Would you like me to focus on any specific pathology topic or organ system?`;
    }
    
    if (lowerMessage.includes('anatomy') || lowerMessage.includes('gross anatomy')) {
      return `Here's your guide to mastering **Anatomy** for medical school and boards:

## 🧠 **Anatomy Study Strategy**
• **3D Visualization**: Use multiple resources to build spatial understanding
• **Clinical Correlation**: Always connect anatomy to clinical relevance
• **Active Learning**: Draw, label, and teach concepts to others
• **Repetition**: Review frequently - anatomy requires memorization + understanding

## 📚 **Essential Anatomy Resources**
• **Netter's Atlas**: Beautiful illustrations and clinical correlations
• **Gray's Anatomy**: Comprehensive reference textbook
• **Complete Anatomy 3D**: Interactive digital atlas
• **Anki Flashcards**: Spaced repetition for memorization

## 🔬 **CHM Anatomy Resources**
• Cadaveric dissection in anatomy lab
• Prosected specimens and models
• Canvas modules with labeled images
• Peer tutoring through Academic Achievement

## ⚡ **High-Yield Systems**
• **Musculoskeletal**: Limbs, spine, joint anatomy
• **Neuroanatomy**: Brain, spinal cord, cranial nerves
• **Cardiovascular**: Heart, great vessels, circulation
• **Respiratory**: Lungs, airways, thoracic cavity
• **Abdomen**: GI organs, retroperitoneum

Focus on understanding relationships between structures rather than just memorizing names!`;
    }
    
    if (lowerMessage.includes('physiology') || lowerMessage.includes('pathophysiology')) {
      return `Master **Physiology** with this strategic approach:

## ⚡ **Physiology Study Method**
• **Understand Normal First**: Master normal function before pathology
• **Focus on Mechanisms**: Learn "how" systems work, not just "what"
• **Integration**: Connect different organ systems and their interactions
• **Problem-Solving**: Use physiology to reason through clinical scenarios

## 📚 **Top Physiology Resources**
• **Costanzo Physiology**: Excellent board review book
• **Guyton & Hall**: Comprehensive textbook reference
• **Board Review Series**: High-yield facts and concepts
• **UWorld Physiology**: Practice questions with detailed explanations

## 🔬 **CHM Physiology Resources**
• M1 physiology course modules on Canvas
• Interactive physiology simulations
• Clinical Skills Center for applied learning
• Study groups through learning societies

## 🎯 **High-Yield Systems**
• **Cardiovascular**: Heart function, blood pressure regulation
• **Respiratory**: Gas exchange, ventilation control
• **Renal**: Filtration, acid-base balance, fluid regulation
• **Endocrine**: Hormone regulation and feedback loops
• **Neurophysiology**: Action potentials, synaptic transmission

Remember: Physiology is the foundation for understanding pathology and pharmacology!`;
    }
    
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
    
    // Format the test for interactive display
    let response = `# ${test.title}\n\n`;
    response += `**Phase:** ${test.phase} | **Week:** ${test.week} | **Questions:** ${test.totalQuestions} | **Time:** ${test.timeAllowed} minutes\n\n`;
    
    // Add curriculum week info
    const weekData = testGenerator.getCurriculumWeek(phase, week);
    if (weekData) {
      response += `**Week Topics:** ${weekData.topics.join(', ')}\n\n`;
    }
    
    response += `---\n\n`;
    
    // Add questions for interactive quiz
    test.questions.forEach((question, index) => {
      response += `**Question ${index + 1}** (${question.difficulty})\n`;
      response += `${question.question}\n\n`;
      
      if (question.type === 'multiple-choice' && question.options) {
        question.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
          response += `${letter}. ${option}\n`;
        });
        response += `\n`;
      }
      
      if (question.type === 'true-false') {
        response += `A. True\nB. False\n\n`;
      }
      
      response += `*Correct Answer:* ${question.type === 'multiple-choice' ? String.fromCharCode(65 + (question.correctAnswer as number)) : (question.correctAnswer ? 'A. True' : 'B. False')}\n`;
      
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
          userId: req.body.userId || null
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
        userId: req.body.userId || null,
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