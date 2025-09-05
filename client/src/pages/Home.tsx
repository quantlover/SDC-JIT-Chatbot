import { ModernChatWidget } from "@/components/ModernChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Users, Calendar, Award, Stethoscope, Brain, Heart, Activity } from "lucide-react";

const learningSocieties = [
  { name: "Jane Adams", count: 36, color: "bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-900 border-cyan-200", icon: Brain },
  { name: "John Dewey", count: 23, color: "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-900 border-emerald-200", icon: Heart },
  { name: "Justin Morrill", count: 62, color: "bg-gradient-to-br from-violet-50 to-purple-50 text-violet-900 border-violet-200", icon: Activity },
  { name: "Dale Hale Williams", count: 35, color: "bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900 border-amber-200", icon: Stethoscope },
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
      {/* Modern Header with Glass Effect */}
      <header className="sticky top-0 z-50 glass-effect shadow-lg border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">JustInTimeMedicine</h1>
                <span className="text-xs text-muted-foreground font-medium">CHM Shared Discovery Curriculum</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-foreground/80 hover:text-primary transition-all duration-200 font-medium text-sm hover:scale-105">For Students</a>
              <a href="#" className="text-foreground/80 hover:text-primary transition-all duration-200 font-medium text-sm hover:scale-105">Resources</a>
              <a href="#" className="text-foreground/80 hover:text-primary transition-all duration-200 font-medium text-sm hover:scale-105">Curriculum</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="gradient-card mb-12 border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Empowering The CHM 
                  <span className="gradient-primary bg-clip-text text-transparent"> Shared Discovery</span> Curriculum
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Access comprehensive resources, curriculum information, and get personalized assistance with the CHM medical education program.
                  Our AI assistant is here to help you succeed in your medical journey.
                </p>
                <Button className="gradient-primary text-white px-8 py-3 text-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105">
                  Start Learning
                  <Activity className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
            
          {/* Learning Society Scoreboard */}
          <div id="learning-societies" className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-4">Learning Society Leaderboard</h3>
              <p className="text-muted-foreground">Track progress and engagement across our medical learning communities</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {learningSocieties.map((society) => {
                const IconComponent = society.icon;
                return (
                  <Card key={society.name} className={`text-center ${society.color} border-2 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}>
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-3">
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <h4 className="font-bold text-base mb-2">{society.name}</h4>
                      <span className="text-3xl font-bold">{society.count}</span>
                      <p className="text-xs mt-2 opacity-80">Active Members</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-4">Quick Access</h3>
              <p className="text-muted-foreground">Jump directly to the resources you need most</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Card key={link.title} className="gradient-card hover:shadow-2xl transition-all duration-300 group hover:scale-105 cursor-pointer border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-xl">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="group-hover:text-primary transition-colors">{link.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{link.description}</p>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto group-hover:translate-x-1 transition-transform">
                        Explore now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* AI Assistant CTA */}
          <Card className="gradient-card border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Need Quick Help?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Our AI assistant is available 24/7 to help you find curriculum information, 
                  schedules, resources, and provide guidance on navigating the CHM program.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <Badge variant="secondary" className="text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">Curriculum Info</Badge>
                  <Badge variant="secondary" className="text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">Class Schedules</Badge>
                  <Badge variant="secondary" className="text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">USMLE Prep</Badge>
                  <Badge variant="secondary" className="text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">Clinical Resources</Badge>
                  <Badge variant="secondary" className="text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">Academic Support</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  AI Assistant is online and ready to help
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Information Cards Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Your Medical Education Journey</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive support and resources throughout every phase of your CHM experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="gradient-card border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Curriculum Phases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="font-medium">M1 Foundation</span>
                <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">Year 1</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="font-medium">MCE Clinical</span>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Year 2</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="font-medium">LCE Clerkships</span>
                <Badge className="bg-violet-100 text-violet-800 border-violet-200">Years 3-4</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Key Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center p-3 bg-background/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                <span className="text-sm font-medium">AAMC Core EPA Materials</span>
              </div>
              <div className="flex items-center p-3 bg-background/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                <span className="text-sm font-medium">Simulation & Clinical Skills</span>
              </div>
              <div className="flex items-center p-3 bg-background/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                <span className="text-sm font-medium">Board Exam Preparation</span>
              </div>
              <div className="flex items-center p-3 bg-background/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                <span className="text-sm font-medium">Medical eBooks & References</span>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Student Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center p-3 bg-background/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                <span className="text-sm font-medium">Academic Achievement Office</span>
              </div>
              <div className="flex items-center p-3 bg-background/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                <span className="text-sm font-medium">Health & Wellness Resources</span>
              </div>
              <div className="flex items-center p-3 bg-background/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                <span className="text-sm font-medium">Research Opportunities</span>
              </div>
              <div className="flex items-center p-3 bg-background/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                <span className="text-sm font-medium">Global Learning Experiences</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modern Chat Widget */}
      <ModernChatWidget />
    </div>
  );
}
