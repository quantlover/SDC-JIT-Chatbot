import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Users, Calendar, Award } from "lucide-react";

const learningSocieties = [
  { name: "Jane Adams", count: 36, color: "bg-blue-50 text-blue-900 border-blue-200" },
  { name: "John Dewey", count: 23, color: "bg-green-50 text-green-900 border-green-200" },
  { name: "Justin Morrill", count: 62, color: "bg-purple-50 text-purple-900 border-purple-200" },
  { name: "Dale Hale Williams", count: 35, color: "bg-orange-50 text-orange-900 border-orange-200" },
];

const quickLinks = [
  {
    title: "Class Information",
    description: "Access class-specific information and schedules",
    icon: Calendar,
    href: "/curriculum/class-specific-information-overview"
  },
  {
    title: "Academic Achievement",
    description: "Resources for academic support and success",
    icon: Award,
    href: "/curriculum/academic_achievement"
  },
  {
    title: "Student Research",
    description: "Explore research opportunities and resources",
    icon: BookOpen,
    href: "/curriculum/chm-research"
  },
  {
    title: "Learning Societies",
    description: "Connect with your learning community",
    icon: Users,
    href: "#learning-societies"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">JustInTimeMedicine</h1>
              <span className="ml-2 text-sm text-muted-foreground">CHM Shared Discovery Curriculum</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">For Students</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Resources</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Curriculum</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Empowering The CHM Shared Discovery Curriculum</h2>
            <p className="text-muted-foreground mb-6">
              Access resources, curriculum information, and get assistance with the CHM medical education program.
              Use our AI assistant to quickly find what you need.
            </p>
            
            {/* Learning Society Scoreboard */}
            <div id="learning-societies" className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Learning Society Leaderboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {learningSocieties.map((society) => (
                  <Card key={society.name} className={`text-center ${society.color} border-2`}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-1">{society.name}</h4>
                      <span className="text-2xl font-bold">{society.count}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Card key={link.title} className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Icon className="h-5 w-5 text-primary" />
                        <span>{link.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{link.description}</p>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto group-hover:underline">
                        Learn more
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Resources */}
            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Need Quick Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Use our AI assistant in the bottom right corner to quickly find curriculum information, 
                schedules, resources, and get guidance on navigating the CHM program.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Curriculum Info</Badge>
                <Badge variant="secondary" className="text-xs">Class Schedules</Badge>
                <Badge variant="secondary" className="text-xs">USMLE Prep</Badge>
                <Badge variant="secondary" className="text-xs">Clinical Resources</Badge>
                <Badge variant="secondary" className="text-xs">Academic Support</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Curriculum Phases</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>M1 Foundation</span>
                  <Badge variant="outline" size="sm">Year 1</Badge>
                </li>
                <li className="flex justify-between">
                  <span>MCE Clinical</span>
                  <Badge variant="outline" size="sm">Year 2</Badge>
                </li>
                <li className="flex justify-between">
                  <span>LCE Clerkships</span>
                  <Badge variant="outline" size="sm">Years 3-4</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <span>Key Resources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• AAMC Core EPA Materials</li>
                <li>• Simulation & Clinical Skills</li>
                <li>• Board Exam Preparation</li>
                <li>• Medical eBooks & References</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Student Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Academic Achievement Office</li>
                <li>• Health & Wellness Resources</li>
                <li>• Research Opportunities</li>
                <li>• Global Learning Experiences</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
