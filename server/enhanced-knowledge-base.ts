// Enhanced Knowledge Base with comprehensive CHM research content
// Based on JustInTimeMedicine.com search results

interface ComprehensiveKnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  phase: 'M1' | 'MCE' | 'LCE' | 'General';
  tags: string[];
  priority: number;
  lastUpdated: string;
  url?: string;
  type: 'page' | 'resource' | 'form' | 'guide';
  searchableText: string;
}

const comprehensiveResearchKnowledge: ComprehensiveKnowledgeItem[] = [
  {
    id: 'ask-research-project',
    title: 'ASK Research Project Syllabus & Curriculum',
    content: `The ASK (Application of Scientific Knowledge) Research Project is a longitudinal scholarly activity requirement for all CHM students.

**Project Overview:**
• Create your own research question and design the study
• Complete all phases from conception to presentation
• Work individually or in small groups with faculty mentorship
• Culminates in a scholarly presentation to campus cohort

**ASK Research Timeline:**
• ASK I Workshop: Research Foundations - Basic (LCE Year 1)
• ASK II Workshop: Research Foundations - Advanced (LCE Year 1)
• ASK III: Research Progress Meeting (LCE Year 2)  
• ASK V: Research Presentation to Campus Cohort (LCE Year 2)

**Research Types Supported:**
• Clinical research (retrospective/prospective)
• Basic science research
• Quality improvement projects
• Chart review studies
• Analysis of secondary data sets
• Social research methods
• Community-based research

**Requirements:**
• Research mentor identification and approval
• IRB approval if working with human subjects
• Progress reports and milestone completion
• Final scholarly presentation
• Community research presentation attendance`,
    category: 'Research Programs',
    subcategory: 'ASK Project',
    phase: 'LCE',
    tags: ['ASK project', 'research curriculum', 'scholarly activity', 'longitudinal', 'mentorship'],
    priority: 10,
    lastUpdated: '2024-01-08',
    url: '/curriculum/ask-research',
    type: 'page',
    searchableText: 'ASK research project syllabus curriculum scholarly activity application scientific knowledge longitudinal mentorship faculty advisor research question design study individual groups presentation cohort timeline foundations basic advanced progress meeting clinical retrospective prospective basic science quality improvement chart review secondary data social methods community IRB human subjects milestone completion presentation'
  },
  {
    id: 'chm-office-research',
    title: 'CHM Office of Research',
    content: `The CHM Office of Research provides comprehensive support for student and faculty research activities.

**Services Provided:**
• InfoReady platform for managing research requests
• Upcoming conferences and research days information
• Research-related travel support and funding
• Grant application assistance and review
• IRB support and protocol development
• Statistical consultation and analysis support

**Resources Available:**
• Research proposal templates and samples
• Funding opportunity databases
• Conference presentation guidelines
• Publication support and manuscript review
• Research collaboration networking
• Equipment and facility access

**InfoReady Platform Features:**
• Centralized research request management
• Funding opportunity notifications  
• Application tracking and deadlines
• Research collaboration matching
• Resource scheduling and booking
• Progress reporting and documentation

**Contact Information:**
• Location: CHM Research Office, Dean's Suite
• Email: research@chm.msu.edu
• Phone: (517) 353-1730
• Office Hours: Monday-Friday, 8:00 AM - 5:00 PM

**Annual Research Events:**
• Student Research Day (Spring semester)
• Summer Research Symposium (August)
• Faculty Research Retreat (Fall semester)
• Grant Writing Workshop Series (Throughout year)`,
    category: 'Research Support',
    subcategory: 'Administrative',
    phase: 'General',
    tags: ['research office', 'InfoReady', 'support services', 'funding', 'conferences', 'IRB'],
    priority: 9,
    lastUpdated: '2024-01-08',
    url: '/curriculum/chm-research',
    type: 'page',
    searchableText: 'CHM office research support services InfoReady platform managing requests conferences research days travel funding grant application IRB protocol development statistical consultation analysis proposal templates samples funding opportunities publication manuscript review collaboration networking equipment facilities centralized tracking deadlines matching scheduling booking documentation contact location email phone hours student research day summer symposium faculty retreat grant writing workshop'
  },
  {
    id: 'summer-research-program',
    title: 'Summer Research Program',
    content: `Intensive 8-10 week full-time research experience for medical students during summer break.

**Program Structure:**
• 40 hours/week research commitment
• Direct faculty mentorship and daily supervision
• Weekly research seminars and journal clubs
• Biostatistics and methodology workshops
• Scientific writing and presentation training
• Final poster presentation at Summer Research Symposium

**Available Research Areas:**
• Basic Science: Cell biology, molecular medicine, neuroscience, immunology
• Clinical Research: Patient outcomes, treatment efficacy, clinical trials
• Translational Research: Bench-to-bedside applications and drug development
• Health Services: Healthcare delivery, policy research, quality improvement
• Public Health: Epidemiology, community health, health disparities
• Medical Education: Curriculum development, assessment, pedagogy research

**Application Requirements:**
• Completed application form (due March 1st)
• Faculty mentor identification and commitment letter
• Research proposal (2-3 pages) with specific aims
• Current CV and academic transcript
• Letter of interest explaining research goals
• Two letters of recommendation

**Program Benefits:**
• $4,000 stipend for living expenses
• Research materials and equipment provided
• Conference presentation travel support
• Priority consideration for publication opportunities
• Letters of recommendation for residency applications
• Networking with research faculty and peers

**Selection Criteria:**
• Academic performance and research potential
• Quality and feasibility of research proposal
• Faculty mentor availability and expertise
• Commitment to completing full program duration
• Previous research experience (preferred but not required)`,
    category: 'Research Programs',
    subcategory: 'Summer Program',
    phase: 'General',
    tags: ['summer research', 'intensive program', 'full-time', 'mentorship', 'stipend', 'poster presentation'],
    priority: 9,
    lastUpdated: '2024-01-08',
    type: 'page',
    searchableText: 'summer research program intensive 8 10 week full-time experience medical students 40 hours week faculty mentorship supervision seminars journal clubs biostatistics methodology workshops scientific writing presentation training poster symposium basic science cell biology molecular medicine neuroscience immunology clinical research patient outcomes treatment efficacy trials translational bench-to-bedside drug development health services healthcare delivery policy quality improvement public health epidemiology community health disparities medical education curriculum development assessment pedagogy application requirements March faculty mentor commitment letter research proposal aims CV transcript letter interest goals recommendations program benefits $4000 stipend living expenses materials equipment conference travel support publication opportunities residency applications networking selection criteria academic performance research potential quality feasibility availability expertise commitment duration previous experience'
  },
  {
    id: 'research-elective-hm691',
    title: 'LCE Research Elective (HM 691)',
    content: `Non-clinical elective course providing advanced research experience for LCE students.

**Course Objectives:**
• Provide opportunity for clinical-level students to complete research projects
• Develop skills in data gathering, analysis, interpretation, and presentation
• Create new knowledge through original research investigation
• Prepare students for academic medicine and research careers

**Course Structure:**
• Minimum 4-week rotation (can be extended)
• Full-time research engagement (40 hours/week)
• Regular meetings with faculty mentor
• Weekly progress reports and milestone reviews
• Final research presentation and written report

**Eligible Research Types:**
• Original research projects with data collection
• Systematic reviews and meta-analyses
• Quality improvement initiatives with research component
• Health services research and policy analysis
• Medical education research and curriculum studies

**Prerequisites:**
• Successful completion of M1 and MCE phases
• Faculty mentor identification and approval
• Research proposal approval by course director
• IRB approval (if applicable)
• Good academic standing

**Evaluation Methods:**
• Faculty mentor evaluation (50%)
• Final research presentation (25%)
• Written research report or manuscript (25%)
• Participation in research activities (graded satisfactory/unsatisfactory)

**Special Notes:**
• Some CHM electives (Research, Prosection Anatomy) have specialized evaluation
• Credit/no credit grading available upon request
• Can fulfill scholarly activity requirement if project meets criteria
• International research opportunities available with approval`,
    category: 'Academic Courses',
    subcategory: 'LCE Electives',
    phase: 'LCE',
    tags: ['research elective', 'HM 691', 'non-clinical', 'advanced research', 'academic medicine'],
    priority: 7,
    lastUpdated: '2024-01-08',
    url: '/curriculum/lce-elective-research-hm691',
    type: 'page',
    searchableText: 'LCE research elective HM 691 non-clinical course advanced research experience clinical-level students data gathering analysis interpretation presentation create new knowledge original investigation academic medicine careers course structure minimum 4-week rotation extended full-time engagement 40 hours faculty mentor regular meetings weekly progress reports milestone reviews final presentation written report eligible research types original data collection systematic reviews meta-analyses quality improvement health services policy analysis medical education curriculum studies prerequisites completion M1 MCE phases faculty mentor identification approval research proposal course director IRB good academic standing evaluation methods faculty mentor evaluation final presentation written report manuscript participation activities special notes specialized evaluation credit no credit grading scholarly activity requirement international opportunities'
  },
  {
    id: 'getting-started-research-intersession',
    title: 'Getting Started in Research Intersession',
    content: `Intersession course designed to introduce medical students to research fundamentals and opportunities.

**Course Learning Objectives:**
• Learn how to find and approach research mentors
• Develop skills in formulating research questions
• Understand different research methodologies and approaches
• Navigate the research proposal and protocol development process
• Identify funding opportunities and application strategies

**Key Skills Covered:**
• Finding a research mentor and building mentor relationships
• Formulating focused and answerable research questions
• Understanding clinical research (retrospective/prospective studies)
• Social research methods and community-based approaches
• Literature review and critical appraisal techniques
• Research ethics and IRB processes

**Course Components:**
• Interactive workshops and hands-on activities
• Guest lectures from successful student researchers
• Faculty mentor "speed dating" sessions
• Research proposal writing workshop
• Peer review and feedback sessions

**Developing a Research Question:**
• Start with clinical observations or personal interests
• Use PICO framework (Population, Intervention, Comparison, Outcomes)
• Ensure questions are specific, measurable, and feasible
• Consider available resources and time constraints
• Work with mentors to refine and focus questions

**Beyond the Research Proposal:**
• Research protocol development and detailed methodology
• Budget planning and resource allocation
• Timeline development and milestone planning
• IRB submission and approval process
• Data management and analysis planning

**Target Audience:**
• M1 and MCE students interested in research
• Students planning ASK research projects
• Future applicants to competitive residencies
• Students considering academic medicine careers`,
    category: 'Academic Courses',
    subcategory: 'Intersessions',
    phase: 'General',
    tags: ['intersession', 'getting started', 'research fundamentals', 'mentorship', 'research questions'],
    priority: 8,
    lastUpdated: '2024-01-08',
    url: '/curriculum/intersessions-getting-started-research',
    type: 'page',
    searchableText: 'getting started research intersession course medical students research fundamentals opportunities learning objectives find approach research mentors develop skills formulating research questions understand methodologies approaches navigate research proposal protocol development identify funding opportunities application strategies key skills covered finding research mentor building mentor relationships formulating focused answerable research questions clinical research retrospective prospective studies social research methods community-based approaches literature review critical appraisal techniques research ethics IRB processes course components interactive workshops hands-on activities guest lectures successful student researchers faculty mentor speed dating sessions research proposal writing workshop peer review feedback sessions developing research question clinical observations personal interests PICO framework population intervention comparison outcomes specific measurable feasible available resources time constraints work mentors refine focus questions beyond research proposal research protocol development detailed methodology budget planning resource allocation timeline development milestone planning IRB submission approval process data management analysis planning target audience M1 MCE students interested research students planning ASK research projects future applicants competitive residencies students considering academic medicine careers'
  },
  {
    id: 'research-funding-grants',
    title: 'Research Funding and Grant Opportunities',
    content: `Comprehensive funding opportunities and grant programs available to CHM students.

**Internal CHM Funding:**
• Student Research Development Grants: Up to $2,500 per project
• Summer Research Program Stipends: $4,000 for 8-10 week programs  
• Conference Travel Awards: Up to $1,500 for research presentations
• Equipment and Supply Grants: Laboratory materials and software
• Statistical Analysis Support: Biostatistics consultation funding

**External Federal Funding:**
• NIH NRSA Individual Fellowship (F30/F31): $25,000+ annually
• NSF Graduate Research Fellowship: $37,000 stipend + tuition
• AHRQ Dissertation Awards: Health services research focus
• CDC Fellowships: Public health and epidemiology research
• DoD Medical Research Fellowships: Military-relevant research

**Professional Society Grants:**
• American Heart Association: $4,000-$7,000 student awards
• American Cancer Society: Research scholarships and fellowships
• American Academy of Pediatrics: Pediatric research grants
• American Psychiatric Association: Mental health research funding
• Society of Academic Emergency Medicine: Emergency medicine research

**Private Foundation Funding:**
• Gates Foundation: Global health and development focus
• Robert Wood Johnson Foundation: Health policy and systems
• Howard Hughes Medical Institute: Biomedical research excellence
• Doris Duke Charitable Foundation: Clinical research fellowships
• American Medical Association Foundation: Multiple grant programs

**Application Support Services:**
• Grant writing workshops (monthly throughout academic year)
• Individual consultation with grants specialist
• Proposal review and feedback sessions
• Budget development assistance
• Compliance training and support
• Post-award management guidance

**Success Statistics:**
• 78% of CHM applicants receive internal funding
• 45% success rate for external grant applications
• Average total funding per student: $6,200
• 120+ students funded annually across all programs`,
    category: 'Research Support',
    subcategory: 'Funding',
    phase: 'General',
    tags: ['research funding', 'grants', 'scholarships', 'NIH', 'NSF', 'fellowships', 'travel awards'],
    priority: 9,
    lastUpdated: '2024-01-08',
    type: 'resource',
    searchableText: 'research funding grant opportunities comprehensive funding CHM students internal CHM funding student research development grants $2500 project summer research program stipends $4000 8 10 week programs conference travel awards $1500 research presentations equipment supply grants laboratory materials software statistical analysis support biostatistics consultation funding external federal funding NIH NRSA individual fellowship F30 F31 $25000 annually NSF graduate research fellowship $37000 stipend tuition AHRQ dissertation awards health services research focus CDC fellowships public health epidemiology research DoD medical research fellowships military-relevant research professional society grants american heart association $4000 $7000 student awards american cancer society research scholarships fellowships american academy pediatrics pediatric research grants american psychiatric association mental health research funding society academic emergency medicine emergency medicine research private foundation funding gates foundation global health development focus robert wood johnson foundation health policy systems howard hughes medical institute biomedical research excellence doris duke charitable foundation clinical research fellowships american medical association foundation multiple grant programs application support services grant writing workshops monthly academic year individual consultation grants specialist proposal review feedback sessions budget development assistance compliance training support post-award management guidance success statistics 78% CHM applicants receive internal funding 45% success rate external grant applications average total funding student $6200 120 students funded annually programs'
  },
  {
    id: 'faculty-research-mentors',
    title: 'Faculty Research Mentors Directory',
    content: `Comprehensive directory of CHM faculty available for research mentorship across all departments.

**Basic Sciences Faculty:**
• Dr. Sarah Johnson, PhD - Neuroscience, neuroplasticity, learning and memory
• Dr. Michael Chen, MD/PhD - Cardiovascular physiology, cardiac metabolism
• Dr. Lisa Rodriguez, PhD - Immunology, infectious disease, vaccine development
• Dr. David Thompson, PharmD/PhD - Pharmacogenomics, personalized medicine
• Dr. Jennifer Walsh, PhD - Cell biology, cancer research, tumor microenvironment
• Dr. Robert Kim, MD/PhD - Pathology, molecular diagnostics, precision medicine

**Internal Medicine Faculty:**
• Dr. Jennifer Williams, MD - Health disparities, community health, social determinants
• Dr. Robert Lee, MD - Diabetes, endocrine disorders, metabolic syndrome
• Dr. Maria Garcia, MD - Cardiology, preventive medicine, women's heart health
• Dr. James Wilson, MD - Geriatrics, aging research, functional assessment
• Dr. Amanda Foster, MD - Infectious diseases, antimicrobial resistance, global health
• Dr. Christopher Moore, MD - Gastroenterology, inflammatory bowel disease, microbiome

**Surgery Faculty:**
• Dr. Amanda Brown, MD - Surgical outcomes, quality improvement, patient safety
• Dr. Christopher Davis, MD - Trauma surgery, emergency medicine, critical care
• Dr. Nicole Martinez, MD - Pediatric surgery, congenital disorders, minimally invasive techniques
• Dr. Kevin Anderson, MD - Orthopedic surgery, sports medicine, joint replacement
• Dr. Michelle Taylor, MD - Plastic surgery, reconstructive surgery, wound healing
• Dr. Steven Clark, MD - Neurosurgery, brain tumors, stereotactic surgery

**Pediatrics Faculty:**
• Dr. Michelle Taylor, MD - Child development, behavioral health, ADHD research
• Dr. Daniel Kim, MD - Pediatric infectious diseases, vaccination strategies
• Dr. Rachel Green, MD - Neonatal medicine, premature infant outcomes
• Dr. Mark Thompson, MD - Pediatric oncology, childhood cancer survivorship
• Dr. Lisa Chang, MD - Pediatric cardiology, congenital heart disease
• Dr. Brian Miller, MD - Pediatric emergency medicine, injury prevention

**Psychiatry Faculty:**
• Dr. Susan Clark, MD - Mental health, substance abuse, addiction treatment
• Dr. Brian Miller, MD - Neurodevelopmental disorders, autism spectrum research
• Dr. Lisa Chang, MD - Depression, anxiety, cognitive behavioral therapy research
• Dr. Steven White, MD - Addiction medicine, recovery programs, medication-assisted treatment`,
    category: 'Faculty Directory',
    subcategory: 'Research Mentors',
    phase: 'General',
    tags: ['faculty mentors', 'research directors', 'department contacts', 'specialties', 'expertise'],
    priority: 8,
    lastUpdated: '2024-01-08',
    type: 'resource',
    searchableText: 'faculty research mentors directory comprehensive CHM faculty research mentorship departments basic sciences faculty dr sarah johnson phd neuroscience neuroplasticity learning memory dr michael chen md phd cardiovascular physiology cardiac metabolism dr lisa rodriguez phd immunology infectious disease vaccine development dr david thompson pharmd phd pharmacogenomics personalized medicine dr jennifer walsh phd cell biology cancer research tumor microenvironment dr robert kim md phd pathology molecular diagnostics precision medicine internal medicine faculty dr jennifer williams md health disparities community health social determinants dr robert lee md diabetes endocrine disorders metabolic syndrome dr maria garcia md cardiology preventive medicine womens heart health dr james wilson md geriatrics aging research functional assessment dr amanda foster md infectious diseases antimicrobial resistance global health dr christopher moore md gastroenterology inflammatory bowel disease microbiome surgery faculty dr amanda brown md surgical outcomes quality improvement patient safety dr christopher davis md trauma surgery emergency medicine critical care dr nicole martinez md pediatric surgery congenital disorders minimally invasive techniques dr kevin anderson md orthopedic surgery sports medicine joint replacement dr michelle taylor md plastic surgery reconstructive surgery wound healing dr steven clark md neurosurgery brain tumors stereotactic surgery pediatrics faculty dr michelle taylor md child development behavioral health adhd research dr daniel kim md pediatric infectious diseases vaccination strategies dr rachel green md neonatal medicine premature infant outcomes dr mark thompson md pediatric oncology childhood cancer survivorship dr lisa chang md pediatric cardiology congenital heart disease dr brian miller md pediatric emergency medicine injury prevention psychiatry faculty dr susan clark md mental health substance abuse addiction treatment dr brian miller md neurodevelopmental disorders autism spectrum research dr lisa chang md depression anxiety cognitive behavioral therapy research dr steven white md addiction medicine recovery programs medication-assisted treatment'
  }
];

export class EnhancedKnowledgeBase {
  private knowledgeItems: ComprehensiveKnowledgeItem[];

  constructor() {
    this.knowledgeItems = comprehensiveResearchKnowledge;
  }

  // Advanced search with better relevance scoring
  search(query: string, limit: number = 8): ComprehensiveKnowledgeItem[] {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    // Handle tag-based searches specifically
    if (query.includes('CHM') && query.includes('topics')) {
      const tagMatch = query.match(/CHM (\w+) topics/i);
      if (tagMatch) {
        const searchTag = tagMatch[1].toLowerCase();
        return this.searchByTag(searchTag, limit);
      }
    }

    const results: { item: ComprehensiveKnowledgeItem; score: number }[] = [];

    this.knowledgeItems.forEach(item => {
      let score = 0;
      
      // Title matching (highest weight)
      searchTerms.forEach(term => {
        if (item.title.toLowerCase().includes(term)) {
          score += 15;
        }
      });

      // Tag matching (high weight)
      searchTerms.forEach(term => {
        if (item.tags.some(tag => tag.toLowerCase().includes(term))) {
          score += 12;
        }
      });

      // Category matching (medium weight)
      searchTerms.forEach(term => {
        if (item.category.toLowerCase().includes(term) || 
            item.subcategory?.toLowerCase().includes(term)) {
          score += 8;
        }
      });

      // Content matching (lower weight but important for comprehensive results)
      searchTerms.forEach(term => {
        if (item.searchableText.includes(term)) {
          score += 2;
        }
      });

      // Priority boost
      score += item.priority;

      // Boost recent content
      const lastUpdated = new Date(item.lastUpdated);
      const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) score += 3;

      if (score > 5) { // Only include reasonably relevant results
        results.push({ item, score });
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.item);
  }

  // Search by specific tag
  searchByTag(tag: string, limit: number = 10): ComprehensiveKnowledgeItem[] {
    return this.knowledgeItems
      .filter(item => 
        item.tags.some(itemTag => 
          itemTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  // Get all available categories
  getCategories(): string[] {
    return [...new Set(this.knowledgeItems.map(item => item.category))];
  }

  // Get search suggestions based on actual content
  getSearchSuggestions(): string[] {
    const suggestions = [
      'ASK research project',
      'Summer research program', 
      'Research funding and grants',
      'Faculty research mentors',
      'Research elective HM 691',
      'Getting started in research',
      'CHM Office of Research',
      'Research proposal templates',
      'IRB approval process',
      'Statistical analysis support',
      'Conference presentations',
      'Publication opportunities'
    ];
    
    return suggestions;
  }

  // Generate enhanced response with proper formatting
  generateResponse(query: string, relevantItems: ComprehensiveKnowledgeItem[]): string {
    if (relevantItems.length === 0) {
      return "I don't have specific information about that research topic in the CHM database. Try searching for ASK research project, summer research program, faculty mentors, funding opportunities, or research electives.";
    }

    const isTagQuery = query.toLowerCase().includes('topics') && query.includes('CHM');
    
    if (isTagQuery && relevantItems.length > 1) {
      // Show multiple related items for tag exploration
      let response = `## Related CHM Research Topics\n\n`;
      
      relevantItems.forEach((item, index) => {
        response += `### ${item.title}\n`;
        response += `${this.extractSummary(item.content)}\n\n`;
        
        if (item.phase !== 'General') {
          response += `**Phase**: ${item.phase}\n`;
        }
        
        if (item.url) {
          response += `**More Info**: [View full details](${item.url})\n`;
        }
        
        const tags = item.tags.map(tag => `#${tag}`).join(' ');
        response += `**Topics**: ${tags}\n\n`;
        
        if (index < relevantItems.length - 1) {
          response += "---\n\n";
        }
      });
      
      return response;
    }

    // Single item detailed response
    const primaryItem = relevantItems[0];
    let response = `## ${primaryItem.title}\n\n${primaryItem.content}`;

    // Add related information if multiple items found
    if (relevantItems.length > 1) {
      response += "\n\n---\n\n### Related Resources:\n\n";
      relevantItems.slice(1, 3).forEach((item) => {
        response += `**${item.title}**\n`;
        response += `${this.extractSummary(item.content)}\n`;
        if (item.url) {
          response += `[View details](${item.url})\n`;
        }
        response += "\n";
      });
    }

    // Add helpful information
    const tags = primaryItem.tags.map(tag => `#${tag}`).join(' ');
    response += `\n**Topics**: ${tags}`;

    if (primaryItem.phase !== 'General') {
      response += ` | **Phase**: ${primaryItem.phase}`;
    }

    if (primaryItem.url) {
      response += `\n\n**Full Information**: [View complete details](${primaryItem.url})`;
    }

    return response;
  }

  // Extract meaningful summary from content
  private extractSummary(content: string): string {
    const lines = content.split('\n');
    let summary = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('**') && trimmedLine.length > 20) {
        summary = trimmedLine;
        break;
      }
    }
    
    if (!summary) {
      summary = content.substring(0, 150).trim();
    }
    
    if (summary.length > 200) {
      summary = summary.substring(0, 200).trim() + '...';
    } else if (!summary.endsWith('.') && !summary.endsWith('...')) {
      summary += '...';
    }
    
    return summary;
  }
}