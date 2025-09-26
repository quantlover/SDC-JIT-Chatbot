import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, X, Send, Bot, User, Paperclip, Mic, ExternalLink } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    suggestions?: string[];
    resources?: Array<{
      title: string;
      url: string;
      description: string;
    }>;
  };
  createdAt?: Date;
}

interface ChatResponse {
  conversationId: string;
  userMessage: Message;
  assistantMessage: Message;
  response: {
    message: string;
    suggestions?: string[];
    resources?: Array<{
      title: string;
      url: string;
      description: string;
    }>;
  };
}

const quickActions = [
  { id: 'curriculum', label: '📚 Curriculum Info', message: 'Tell me about the CHM curriculum structure' },
  { id: 'schedules', label: '📅 Class Schedules', message: 'Show me class schedules and important dates' },
  { id: 'resources', label: '🔬 Resources', message: 'What resources are available for medical students?' },
  { id: 'help', label: '❓ Get Help', message: 'I need help navigating the website' },
];

const searchSuggestions = [
  'LCE clerkships',
  'USMLE prep',
  'simulation resources',
  'M1 schedule',
  'learning societies',
  'board exam prep'
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        conversationId,
      });
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      // Replace temporary user message with real one and add assistant message
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => !msg.id.startsWith('temp-'));
        return [...withoutTemp, data.userMessage, data.assistantMessage];
      });
      setConversationId(data.conversationId);
      scrollToBottom();
    },
    onError: (error) => {
      // Remove temporary user message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      
      toast({
        title: "Connection Error",
        description: "I'm having trouble connecting right now. Please try again or browse the resources section.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I\'m your CHM AI Assistant. I can help you with curriculum information, finding resources, navigating course materials, and academic support. How can I assist you today?',
        createdAt: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message || chatMutation.isPending) return;

    setInputValue('');
    setShowSuggestions(false);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Add user message to local state immediately for better UX
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    chatMutation.mutate(message);
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (chatMutation.isPending) return;
    
    setInputValue(action.message);
    // Automatically send the quick action as a message
    setTimeout(() => {
      if (!chatMutation.isPending) {
        chatMutation.mutate(action.message);
        setInputValue('');
      }
    }, 100);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (chatMutation.isPending) return;
    
    setInputValue(suggestion);
    setShowSuggestions(false);
    // Automatically send the suggestion as a message
    setTimeout(() => {
      if (!chatMutation.isPending) {
        chatMutation.mutate(suggestion);
        setInputValue('');
      }
    }, 100);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 80) + 'px';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      {!isOpen ? (
        <button
          aria-label="Open CHM AI Assistant"
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-24 transition-transform hover:scale-105 focus:outline-none"
        >
          {/* Sparty body - MSU green */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-green-600 to-green-700 shadow-xl" />
          {/* Sparty head */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-b from-green-500 to-green-600 border-2 border-green-400 shadow-md flex items-center justify-center">
            {/* Sparty eyes */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white group-hover:animate-pulse transition-all" />
              <span className="w-2.5 h-2.5 rounded-full bg-white group-hover:animate-pulse transition-all" />
            </div>
          </div>
          {/* Sparty helmet/hat */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-3 bg-gradient-to-b from-green-400 to-green-500 rounded-t-full" />
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-2 bg-green-300 rounded-t-full" />
          {/* MSU "S" on body */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg drop-shadow-md">S</span>
          </div>
          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-bold border-2 border-white rounded-full">AI</Badge>
        </button>
      ) : (
        <Button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-4 shadow-lg transition-all duration-300 hover:shadow-xl bg-red-600 hover:bg-red-700"
          size="lg"
        >
          <X className="h-6 w-6" />
        </Button>
      )}
      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] shadow-2xl animate-slide-up flex flex-col">
          {/* Chat Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">CHM AI Assistant</h3>
                  <p className="text-xs text-primary-foreground/80">Powered by JustInTimeMedicine</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Online</span>
              </div>
            </div>
          </CardHeader>

          {/* Quick Actions */}
          <div className="p-3 bg-muted/50 border-b">
            <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleQuickAction(action)}
                  disabled={chatMutation.isPending}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`rounded-2xl p-3 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Resources */}
                  {message.metadata?.resources && message.metadata.resources.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.metadata.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url.startsWith('http') ? resource.url : `https://www.justintimemedicine.com${resource.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-primary hover:text-primary/80 underline flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>{resource.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.metadata.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={chatMutation.isPending}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {chatMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t bg-background rounded-b-lg">
            {/* Search Suggestions */}
            {showSuggestions && inputValue === '' && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Popular searches:</p>
                <div className="flex flex-wrap gap-1">
                  {searchSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 h-6 hover:bg-blue-200 dark:hover:bg-blue-800"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Ask me about CHM curriculum, resources, schedules..."
                  className="resize-none pr-12 text-sm min-h-[40px] max-h-20"
                  disabled={chatMutation.isPending}
                />
                <div className="absolute bottom-1 right-1 text-xs text-muted-foreground">
                  {inputValue.length}/500
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || inputValue.length > 500 || chatMutation.isPending}
                size="sm"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Additional Options */}
            <div className="mt-2 flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-xs h-6 p-1">
                <Paperclip className="h-3 w-3 mr-1" />
                Attach file
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-6 p-1">
                <Mic className="h-3 w-3 mr-1" />
                Voice
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
