// Comprehensive CHM Medical Education Knowledge Base
// This contains structured curriculum data for the College of Human Medicine's Shared Discovery Curriculum

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  phase: 'M1' | 'MCE' | 'LCE' | 'General';
  tags: string[];
  priority: number;
  lastUpdated: string;
}

export const chmKnowledgeBase: KnowledgeItem[] = [
  // M1 Foundation Phase
  {
    id: 'chm-m1-overview',
    title: 'M1 Foundation Phase Overview',
    content: `The M1 Foundation Phase is the first year of the CHM Shared Discovery Curriculum, focusing on building essential medical knowledge and skills.

Key Components:
• Foundational Sciences: Anatomy, Physiology, Biochemistry, Pathology
• Clinical Skills Development: Physical examination, medical history taking
• Professional Development: Medical ethics, communication skills
• Problem-Based Learning (PBL): Small group case discussions
• Longitudinal Integrated Curriculum: Connecting basic sciences to clinical practice

Duration: 12 months
Assessment: NBME subject exams, practical assessments, portfolio evaluation
Learning Societies: Students are assigned to one of four learning societies (Jane Adams, John Dewey, Justin Morrill, Dale Hale Williams)`,
    category: 'Curriculum Structure',
    phase: 'M1',
    tags: ['M1', 'foundation', 'curriculum', 'overview', 'basic sciences'],
    priority: 10,
    lastUpdated: '2024-01-15'
  },
  
  {
    id: 'chm-learning-societies',
    title: 'CHM Learning Societies System',
    content: `The CHM uses a Learning Society model to create smaller communities within the larger medical school class.

The Four Learning Societies:
• Jane Adams Society: Named after the social worker and Nobel Peace Prize winner
• John Dewey Society: Named after the philosopher and educational reformer  
• Justin Morrill Society: Named after the sponsor of the Morrill Act establishing land-grant universities
• Dale Hale Williams Society: Named after the pioneering African American surgeon

Purpose and Benefits:
• Mentorship: Faculty advisors and near-peer mentors
• Community Building: Social events and study groups
• Academic Support: Collaborative learning opportunities
• Professional Development: Networking and career guidance
• Competition: Friendly academic and service competitions

Activities:
• Weekly society meetings
• Community service projects
• Academic competitions
• Social events and traditions
• Peer mentoring programs`,
    category: 'Student Life',
    phase: 'General',
    tags: ['learning societies', 'mentorship', 'community', 'student life'],
    priority: 9,
    lastUpdated: '2024-01-10'
  },

  {
    id: 'chm-mce-rotations',
    title: 'MCE Clinical Experience Rotations',
    content: `The MCE (Medical Clinical Experience) phase consists of required clinical rotations in core specialties.

Required Core Rotations (4 weeks each):
• Internal Medicine: Inpatient and outpatient medicine
• Surgery: General surgery with subspecialty exposure
• Pediatrics: Inpatient, outpatient, and subspecialty rotations
• Obstetrics/Gynecology: Labor & delivery, clinic, surgery
• Psychiatry: Inpatient and outpatient mental health
• Family Medicine: Primary care in community settings
• Emergency Medicine: Level 1 trauma center experience

Selective Rotations (2-4 weeks each):
• Neurology • Radiology • Anesthesiology
• Pathology • Dermatology • Ophthalmology
• Otolaryngology • Orthopedics • Urology

Assessment Methods:
• Clinical evaluation by attending physicians
• OSCE (Objective Structured Clinical Examinations)
• Case presentations and oral examinations
• NBME clinical subject examinations
• Professional behavior assessments`,
    category: 'Clinical Training',
    phase: 'MCE',
    tags: ['MCE', 'rotations', 'clinical', 'specialties', 'assessment'],
    priority: 9,
    lastUpdated: '2024-01-12'
  },

  {
    id: 'chm-lce-clerkships',
    title: 'LCE Advanced Clinical Experiences',
    content: `The LCE (Longitudinal Clinical Experience) represents years 3-4 of medical school with advanced clinical training.

Acting Internships (AI):
• Internal Medicine AI: 4 weeks of sub-intern responsibility
• Surgery AI: Advanced surgical skills and patient management
• Emergency Medicine AI: Independent patient care with supervision
• Family Medicine AI: Comprehensive primary care experience

Elective Rotations:
• Subspecialty Medicine: Cardiology, Gastroenterology, Endocrinology
• Surgical Subspecialties: Orthopedics, Neurosurgery, Plastic Surgery
• Diagnostic Specialties: Radiology, Pathology
• International/Away Rotations: Partner institutions worldwide
• Research Rotations: Clinical and translational research

USMLE Preparation:
• Step 1: Basic science knowledge (taken after M1)
• Step 2 CK: Clinical knowledge (taken during LCE)
• Step 2 CS: Clinical skills assessment
• Dedicated study periods built into schedule

Residency Preparation:
• Application strategy workshops
• Interview skills training
• Personal statement development
• Research opportunity coordination`,
    category: 'Advanced Clinical Training',
    phase: 'LCE',
    tags: ['LCE', 'clerkships', 'USMLE', 'residency', 'electives'],
    priority: 8,
    lastUpdated: '2024-01-08'
  },

  {
    id: 'chm-simulation-center',
    title: 'CHM Simulation and Clinical Skills Center',
    content: `The CHM Simulation Center provides hands-on training in a safe, controlled environment.

High-Fidelity Simulation Labs:
• Patient simulators for emergency scenarios
• Surgical skills training stations
• Birthing simulation for OB/GYN training
• Pediatric and neonatal simulators
• Anesthesia and critical care scenarios

Standardized Patient Program:
• Professional actors trained as patients
• OSCE examinations
• Communication skills training
• Physical examination practice
• Difficult conversation scenarios

Clinical Skills Training:
• Phlebotomy and IV insertion
• Suturing and wound care
• Urinary catheterization
• Central line placement (advanced)
• Intubation and airway management

Assessment Integration:
• Formative skill assessments
• Summative OSCE examinations
• Competency-based progression
• Video review and feedback
• Peer-to-peer learning`,
    category: 'Clinical Skills',
    phase: 'General',
    tags: ['simulation', 'clinical skills', 'OSCE', 'hands-on training'],
    priority: 7,
    lastUpdated: '2024-01-14'
  },

  {
    id: 'chm-research-opportunities',
    title: 'CHM Research Opportunities and Requirements',
    content: `Research is integrated throughout the CHM curriculum with multiple opportunities for student engagement.

Required Scholarly Activity:
• All students must complete a scholarly project
• Options include clinical research, basic science, public health, medical education
• Faculty mentor assignment in area of interest
• Presentation at research symposium required

Research Programs:
• Summer Research Fellowship: Paid 10-week intensive research
• Student Research Day: Annual poster and presentation competition
• National Conference Presentations: Travel funding available
• Peer-reviewed Publications: Co-authorship opportunities

Research Areas:
• Clinical Medicine: Patient-oriented research
• Basic Sciences: Laboratory-based investigations
• Public Health: Population health and epidemiology
• Medical Education: Curriculum and teaching innovation
• Global Health: International health disparities
• Health Services: Healthcare delivery and policy

Support Resources:
• Biostatistics consultation
• IRB (Institutional Review Board) guidance
• Grant writing workshops
• Research methodology courses
• Mentorship matching program`,
    category: 'Research',
    phase: 'General',
    tags: ['research', 'scholarly activity', 'publications', 'mentorship'],
    priority: 6,
    lastUpdated: '2024-01-11'
  },

  {
    id: 'chm-board-prep',
    title: 'Board Examination Preparation Strategy',
    content: `Comprehensive preparation for USMLE Steps 1, 2 CK, and 2 CS examinations.

USMLE Step 1 Preparation:
• Timing: Typically taken after M1 year
• Content: Basic science foundations
• Recommended Resources: First Aid, UWorld, Pathoma, Sketchy Medical
• Study Timeline: 4-6 weeks dedicated study period
• Practice Exams: NBME practice tests, UWorld Self-Assessments

USMLE Step 2 CK Preparation:
• Timing: During LCE phase (typically M4 year)
• Content: Clinical knowledge and patient management
• Recommended Resources: UWorld Step 2, Master the Boards
• Integration: Built into clinical rotations
• Question Banks: Daily practice throughout clinical years

USMLE Step 2 CS Preparation:
• Clinical Skills Assessment: Standardized patient encounters
• Communication: Patient interview and counseling skills
• Physical Exam: Focused examinations based on chief complaint
• Documentation: Patient notes and differential diagnosis
• Practice: Integrated throughout clinical skills curriculum

Study Resources Available:
• Kaplan Medical courses (school discount)
• UWorld subscriptions (institutional access)
• NBME practice examinations
• Peer study groups and tutoring
• Faculty advisors for study planning`,
    category: 'Board Examinations',
    phase: 'General',
    tags: ['USMLE', 'board exams', 'step 1', 'step 2', 'preparation'],
    priority: 8,
    lastUpdated: '2024-01-13'
  },

  {
    id: 'chm-wellness-support',
    title: 'Student Wellness and Support Services',
    content: `CHM prioritizes student wellbeing with comprehensive support services.

Mental Health Services:
• Confidential counseling services
• Stress management workshops
• Mindfulness and meditation programs
• Crisis intervention and emergency support
• Referral to community mental health resources

Academic Support:
• Learning specialists and tutoring
• Study skills workshops
• Time management training
• Accommodation services for disabilities
• Remediation programs for struggling students

Health and Wellness:
• Campus recreation facilities
• Fitness classes and personal training
• Nutrition counseling
• Sleep hygiene education
• Substance abuse prevention and treatment

Financial Support:
• Emergency financial assistance
• Scholarship and grant opportunities
• Financial planning and debt management
• Work-study opportunities
• Loan counseling and repayment options

Community Building:
• Student organizations and clubs
• Social events and traditions
• Volunteer opportunities
• Cultural and diversity programming
• Family support for married students`,
    category: 'Student Support',
    phase: 'General',
    tags: ['wellness', 'mental health', 'academic support', 'community'],
    priority: 7,
    lastUpdated: '2024-01-09'
  },

  {
    id: 'chm-match-residency',
    title: 'Residency Match Process and Career Planning',
    content: `Comprehensive guidance for residency application and matching process.

Timeline and Milestones:
• M1-M2: Explore specialties through shadowing and electives
• M3: Complete core rotations, identify specialty interests
• Early M4: Take Step 2 CK, complete away rotations
• Fall M4: Submit ERAS applications, interview season
• March M4: Match Day and results

Application Components:
• USMLE Scores: Step 1, Step 2 CK (and CS when required)
• Clinical Grades: Core rotation evaluations and honors
• Research and Publications: Scholarly activity documentation
• Personal Statement: Specialty-specific narrative
• Letters of Recommendation: Department chairs and mentors
• Extracurricular Activities: Leadership and service

Specialty-Specific Guidance:
• Primary Care: Family Medicine, Internal Medicine, Pediatrics
• Surgical Specialties: General Surgery, subspecialties
• Competitive Specialties: Dermatology, Radiology, Anesthesiology
• Academic Medicine: Research-heavy programs
• Geographic Preferences: Regional vs. national applications

Career Services:
• Individual career counseling
• Residency application workshops
• Interview preparation and mock interviews
• Couples match guidance
• International medical graduate support
• Alternative career pathway exploration

Match Statistics and Success:
• CHM match rate: >95% into first or second choice
• Specialty placement tracking
• Away rotation coordination
• Letter of recommendation management`,
    category: 'Career Planning',
    phase: 'LCE',
    tags: ['residency', 'match', 'career planning', 'ERAS', 'interviews'],
    priority: 8,
    lastUpdated: '2024-01-16'
  },

  {
    id: 'chm-global-health',
    title: 'Global Health and International Opportunities',
    content: `CHM offers extensive global health experiences and international learning opportunities.

International Elective Rotations:
• Partner institutions in 15+ countries
• Clinical rotations in underserved communities
• Research collaborations with international faculty
• Language immersion opportunities
• Cultural competency development

Global Health Curriculum:
• Required global health didactics
• Tropical disease and travel medicine
• Health disparities and social determinants
• Healthcare delivery in resource-limited settings
• International healthcare systems comparison

Service Learning:
• Medical mission trips during breaks
• Community health projects in developing countries
• Disaster relief and humanitarian aid
• Public health interventions and prevention
• Healthcare infrastructure development

Preparation and Safety:
• Pre-departure orientation and training
• Vaccination and health requirements
• Travel insurance and emergency protocols
• Cultural sensitivity training
• Language preparation courses

Funding and Scholarships:
• Global health fellowship awards
• Travel grants for international experiences
• Research funding for global health projects
• Partnership with international NGOs
• Alumni-sponsored opportunities

Career Pathways:
• Global health residency tracks
• International medical careers
• Public health and policy work
• Academic global health positions
• Non-profit and NGO leadership`,
    category: 'Global Health',
    phase: 'General',
    tags: ['global health', 'international', 'service learning', 'cultural competency'],
    priority: 6,
    lastUpdated: '2024-01-07'
  }
];

export class MedicalKnowledgeBase {
  private knowledge: KnowledgeItem[];

  constructor() {
    this.knowledge = chmKnowledgeBase;
  }

  // Search knowledge base by query
  search(query: string, limit: number = 5): KnowledgeItem[] {
    const searchTerms = query.toLowerCase().split(' ');
    
    const scored = this.knowledge.map(item => {
      let score = 0;
      const searchableText = `${item.title} ${item.content} ${item.tags.join(' ')} ${item.category}`.toLowerCase();
      
      searchTerms.forEach(term => {
        if (item.title.toLowerCase().includes(term)) score += 10;
        if (item.tags.some(tag => tag.toLowerCase().includes(term))) score += 8;
        if (item.category.toLowerCase().includes(term)) score += 6;
        if (searchableText.includes(term)) score += 1;
      });
      
      // Boost priority items
      score += item.priority;
      
      return { item, score };
    });

    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item }) => item);
  }

  // Get items by category
  getByCategory(category: string): KnowledgeItem[] {
    return this.knowledge
      .filter(item => item.category.toLowerCase().includes(category.toLowerCase()))
      .sort((a, b) => b.priority - a.priority);
  }

  // Get items by phase
  getByPhase(phase: 'M1' | 'MCE' | 'LCE' | 'General'): KnowledgeItem[] {
    return this.knowledge
      .filter(item => item.phase === phase)
      .sort((a, b) => b.priority - a.priority);
  }

  // Get items by tags
  getByTags(tags: string[]): KnowledgeItem[] {
    return this.knowledge
      .filter(item => 
        tags.some(tag => 
          item.tags.some(itemTag => 
            itemTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      )
      .sort((a, b) => b.priority - a.priority);
  }

  // Get all categories
  getCategories(): string[] {
    return [...new Set(this.knowledge.map(item => item.category))];
  }

  // Get all tags
  getAllTags(): string[] {
    const allTags = this.knowledge.flatMap(item => item.tags);
    return [...new Set(allTags)];
  }

  // Get popular search suggestions
  getSearchSuggestions(): string[] {
    return [
      'Learning societies',
      'M1 curriculum',
      'MCE rotations',
      'USMLE preparation',
      'Research opportunities',
      'Clinical skills',
      'Board exam prep',
      'Residency match',
      'Global health',
      'Student wellness',
      'Simulation center',
      'LCE clerkships'
    ];
  }

  // Generate contextual response with proper formatting
  generateResponse(query: string, relevantItems: KnowledgeItem[]): string {
    if (relevantItems.length === 0) {
      return "I don't have specific information about that topic in the CHM curriculum database. Could you try rephrasing your question or asking about M1 foundation courses, MCE rotations, LCE clerkships, learning societies, or other aspects of the CHM Shared Discovery Curriculum?";
    }

    const primaryItem = relevantItems[0];
    
    // Format the main content with proper line breaks
    let response = `## ${primaryItem.title}\n\n${primaryItem.content}`;

    // Add related information if multiple items found
    if (relevantItems.length > 1) {
      response += "\n\n---\n\n### Related Information:\n\n";
      relevantItems.slice(1, 3).forEach((item, index) => {
        const summary = this.extractSummary(item.content);
        response += `**${item.title}**\n${summary}\n\n`;
      });
    }

    // Add helpful tags in a cleaner format
    const tags = primaryItem.tags.map(tag => `#${tag}`).join(' ');
    response += `\n**Topics**: ${tags}`;

    // Add phase information if available
    if (primaryItem.phase !== 'General') {
      response += ` | **Phase**: ${primaryItem.phase}`;
    }

    return response;
  }

  // Extract a clean summary from content
  private extractSummary(content: string): string {
    // Find the first paragraph or section
    const lines = content.split('\n');
    let summary = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')) {
        summary = trimmedLine;
        break;
      }
    }
    
    // If no good summary found, take first 120 characters
    if (!summary) {
      summary = content.substring(0, 120).trim();
    }
    
    // Ensure it's not too long and ends properly
    if (summary.length > 150) {
      summary = summary.substring(0, 150).trim() + '...';
    } else if (!summary.endsWith('.') && !summary.endsWith('...')) {
      summary += '...';
    }
    
    return summary;
  }
}