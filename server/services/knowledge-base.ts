export interface KnowledgeItem {
  title: string;
  url: string;
  description: string;
  keywords: string[];
  section: string;
}

export const chmKnowledgeBase: KnowledgeItem[] = [
  // Learning Societies
  {
    title: "Jane Adams Learning Society",
    url: "/curriculum/jane-addams-learning-society",
    description: "Learning society with 36 students, part of CHM's collaborative learning approach",
    keywords: ["jane adams", "learning society", "collaborative learning"],
    section: "Learning Societies"
  },
  {
    title: "John Dewey Learning Society", 
    url: "/curriculum/john-dewey-learning-society",
    description: "Learning society with 23 students, emphasizing experiential learning",
    keywords: ["john dewey", "learning society", "experiential learning"],
    section: "Learning Societies"
  },
  {
    title: "Justin Morrill Learning Society",
    url: "/curriculum/justin-morrill-learning-society", 
    description: "Learning society with 62 students, focused on practical application",
    keywords: ["justin morrill", "learning society", "practical application"],
    section: "Learning Societies"
  },
  {
    title: "Dale Hale Williams Learning Society",
    url: "/curriculum/williams-learning-society",
    description: "Learning society with 35 students, honoring medical innovation",
    keywords: ["dale hale williams", "williams", "learning society", "medical innovation"],
    section: "Learning Societies"
  },

  // Curriculum Information
  {
    title: "Class Specific Information",
    url: "/curriculum/class-specific-information-overview",
    description: "Overview of class-specific information, schedules, and important dates",
    keywords: ["class information", "schedules", "dates", "class specific"],
    section: "Curriculum"
  },
  {
    title: "M1 Content by Weeks",
    url: "/curriculum/m1-weeks-by-date",
    description: "M1 curriculum content organized by weekly schedule and dates",
    keywords: ["m1", "first year", "curriculum", "schedule", "weeks"],
    section: "M1 Curriculum"
  },
  {
    title: "MCE Rotation Topics",
    url: "/curriculum/mce-rotation-topics",
    description: "Middle Clinical Experience rotation topics and requirements",
    keywords: ["mce", "middle clinical", "rotations", "clinical experience"],
    section: "Middle Clinical Experience"
  },
  {
    title: "MCE Weekly Topics",
    url: "/curriculum/mce-c3-weeks-by-date",
    description: "MCE curriculum organized by weekly topics and schedule",
    keywords: ["mce", "weekly topics", "middle clinical", "schedule"],
    section: "Middle Clinical Experience"
  },
  {
    title: "LCE Clerkship Handbooks",
    url: "/curriculum/clerkship-handbooks",
    description: "Late Clinical Experience clerkship handbooks and guidance",
    keywords: ["lce", "clerkships", "handbooks", "late clinical", "clinical rotations"],
    section: "Late Clinical Experience"
  },
  {
    title: "LCE Guide for 2025",
    url: "/curriculum/lce-guide-landing-page",
    description: "Comprehensive guide for students entering LCE in 2025",
    keywords: ["lce", "2025", "guide", "late clinical experience"],
    section: "Late Clinical Experience"
  },
  {
    title: "Advanced Skills & Knowledge (ASK) I-V",
    url: "/curriculum/ask",
    description: "Advanced skills and knowledge modules ASK I through V",
    keywords: ["ask", "advanced skills", "knowledge", "modules"],
    section: "Late Clinical Experience"
  },

  // Academic Support
  {
    title: "Office of Academic Achievement",
    url: "/curriculum/academic_achievement",
    description: "Academic support services and achievement resources",
    keywords: ["academic achievement", "support", "tutoring", "academic success"],
    section: "Academic Support"
  },
  {
    title: "LCE Academic Achievement Resources",
    url: "/curriculum/academic_achievement_lce",
    description: "Academic achievement resources specifically for LCE students",
    keywords: ["lce", "academic achievement", "support", "resources"],
    section: "Academic Support"
  },

  // Resources
  {
    title: "AAMC Core EPA",
    url: "/curriculum/aamc-core-epa",
    description: "AAMC Core Entrustable Professional Activities for Entering Residency",
    keywords: ["aamc", "epa", "entrustable", "professional", "activities", "residency"],
    section: "Resources"
  },
  {
    title: "Simulation Resources",
    url: "/curriculum/simulation-resources", 
    description: "Clinical simulation resources and training materials",
    keywords: ["simulation", "clinical skills", "training", "practice"],
    section: "Resources"
  },
  {
    title: "Medical eBooks",
    url: "https://libguides.lib.msu.edu/medicalebooks",
    description: "Access to medical textbooks and electronic resources",
    keywords: ["ebooks", "textbooks", "medical books", "library"],
    section: "Resources"
  },
  {
    title: "Board Exam Preparation",
    url: "https://libguides.lib.msu.edu/medicalboardexamprep/usmle1",
    description: "USMLE and board examination preparation resources",
    keywords: ["usmle", "board exam", "exam prep", "step 1", "step 2"],
    section: "Resources"
  },
  {
    title: "CXR Tutorials",
    url: "/curriculum/chest-x-ray-tutorials",
    description: "Chest X-ray interpretation tutorials and training materials",
    keywords: ["chest x-ray", "cxr", "radiology", "imaging", "interpretation"],
    section: "Clinical Resources"
  },
  {
    title: "EKG Resources",
    url: "/curriculum/electrocardiogram-resources",
    description: "Electrocardiogram interpretation and learning resources",
    keywords: ["ekg", "ecg", "electrocardiogram", "cardiac", "rhythm"],
    section: "Clinical Resources"
  },
  {
    title: "Clinical Media Resources",
    url: "/curriculum/clinical-media-resources",
    description: "Clinical videos, images, and multimedia learning resources",
    keywords: ["clinical media", "videos", "images", "multimedia"],
    section: "Clinical Resources"
  },

  // Quick References
  {
    title: "Diseases You Should Know",
    url: "/curriculum/diseases-you-should-know",
    description: "Essential diseases and conditions for medical students",
    keywords: ["diseases", "conditions", "pathology", "clinical knowledge"],
    section: "Quick Reference"
  },
  {
    title: "Quick Hitters",
    url: "/curriculum/quick-hitters",
    description: "Quick reference materials and high-yield information",
    keywords: ["quick hitters", "high yield", "review", "reference"],
    section: "Quick Reference"
  },
  {
    title: "Quick Reference Tables",
    url: "/curriculum/reference-tables",
    description: "Quick reference tables for clinical and academic use",
    keywords: ["reference tables", "quick reference", "tables", "clinical data"],
    section: "Quick Reference"
  },

  // Student Life
  {
    title: "Service Learning",
    url: "/curriculum/service-learning",
    description: "Service learning opportunities and community engagement",
    keywords: ["service learning", "community", "volunteer", "service"],
    section: "Student Life"
  },
  {
    title: "Student Research",
    url: "/curriculum/chm-research",
    description: "Student research opportunities and resources",
    keywords: ["research", "student research", "projects", "scholarship"],
    section: "Student Life"
  },
  {
    title: "Global Electives",
    url: "/curriculum/independent-global-electives",
    description: "Independent global elective opportunities and international experiences",
    keywords: ["global", "electives", "international", "abroad"],
    section: "Student Life"
  },
  {
    title: "Health and Wellness",
    url: "/curriculum/health-wellness",
    description: "Student health and wellness resources and support",
    keywords: ["health", "wellness", "mental health", "support", "counseling"],
    section: "Student Life"
  }
];

export function searchKnowledgeBase(query: string, limit = 5): KnowledgeItem[] {
  const queryWords = query.toLowerCase().split(/\s+/);
  
  const results = chmKnowledgeBase
    .map(item => {
      let score = 0;
      const searchText = `${item.title} ${item.description} ${item.keywords.join(' ')}`.toLowerCase();
      
      queryWords.forEach(word => {
        if (item.keywords.some(keyword => keyword.includes(word))) {
          score += 3; // High score for keyword matches
        } else if (item.title.toLowerCase().includes(word)) {
          score += 2; // Medium score for title matches
        } else if (searchText.includes(word)) {
          score += 1; // Low score for description matches
        }
      });
      
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results;
}
