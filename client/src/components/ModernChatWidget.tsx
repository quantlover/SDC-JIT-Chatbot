import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
  Send, 
  MessageSquare, 
  X,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
  conversation: { id: string };
}

export function ModernChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(() => {
    // Load conversation ID from localStorage on component mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatConversationId');
    }
    return null;
  });
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch conversation history
  const { data: conversationData } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const response = await apiRequest('GET', `/api/conversations/${conversationId}`);
      return response.json();
    },
    enabled: !!conversationId && isOpen,
  });

  // Load messages from conversation data
  useEffect(() => {
    if (conversationData?.messages) {
      const formattedMessages = conversationData.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      }));
      setMessages(formattedMessages);
    }
  }, [conversationData]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        conversationId,
      });
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      // Update conversation ID if new
      if (!conversationId) {
        setConversationId(data.conversation.id);
        localStorage.setItem('chatConversationId', data.conversation.id);
      }
      
      // Only add assistant message since user message was already added immediately
      setMessages(prev => [...prev, data.assistantMessage]);
      
      // Invalidate conversation cache to refetch latest messages
      queryClient.invalidateQueries({ queryKey: ['conversation', data.conversation.id] });
      
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Connection Error",
        description: "I'm having trouble connecting right now. Please try again.",
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
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm your **CHM AI Assistant**. I can help you with:

• 📚 **Curriculum information** - M1, MCE, LCE phases
• 🏥 **Learning societies** - Jane Adams, John Dewey, Justin Morrill, Dale Hale Williams  
• 📖 **Academic resources** - USMLE prep, clinical skills, research opportunities
• 💡 **Study guidance** - Board exam preparation, academic achievement

**Quick examples:**
- "Tell me about M1 week 2"
- "What are learning societies?"
- "Help me prepare for USMLE Step 1"

How can I assist you today?`,
        createdAt: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!message.trim() || chatMutation.isPending) return;

    const userMessage = message.trim();
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      createdAt: new Date(),
    };
    
    // Add user message immediately to show it
    setMessages(prev => [...prev, tempUserMessage]);
    setMessage('');
    
    chatMutation.mutate(userMessage);
  };

  const handleTagClick = (tag: string) => {
    const tagQuery = `Tell me about CHM ${tag} topics`;
    setMessage(tagQuery);
    // Auto-send the hashtag query after a brief delay
    setTimeout(() => {
      if (!chatMutation.isPending) {
        chatMutation.mutate(tagQuery);
        setMessage('');
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="floating-button gradient-primary text-white rounded-full w-16 h-16 p-0 hover:scale-110 transition-all duration-300"
          size="lg"
        >
          <MessageSquare className="h-8 w-8" />
          <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 h-5 w-5 flex items-center justify-center text-xs font-bold text-white border-2 border-white rounded-full animate-pulse">
            <Sparkles className="h-3 w-3" />
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "gradient-card border-0 shadow-2xl backdrop-blur-2xl transition-all duration-300",
        isMinimized 
          ? "w-80 h-16" 
          : "w-96 h-[600px]"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border/20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">CHM AI Assistant</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/40 dark:bg-gray-900/40 h-[480px]">
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl shadow-sm",
                    msg.role === 'user'
                      ? "gradient-primary text-white"
                      : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-border/20"
                  )}>
                    <div className="prose prose-sm max-w-none text-inherit">
                      <MarkdownRenderer 
                        content={msg.content} 
                        onTagClick={handleTagClick}
                      />
                    </div>
                    <div className={cn(
                      "text-xs mt-2",
                      msg.role === 'user' 
                        ? "text-white/70" 
                        : "text-muted-foreground"
                    )}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-border/20">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="p-4 border-t border-border/20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-b-xl">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about CHM curriculum..."
                    onKeyPress={handleKeyPress}
                    disabled={chatMutation.isPending}
                    className="pr-12 rounded-full border-0 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={chatMutation.isPending || !message.trim()}
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 gradient-primary text-white rounded-full h-8 w-8 p-0 hover:scale-105 transition-all duration-200"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-1 mt-2">
                {['M1 Curriculum', 'Learning Societies', 'USMLE Prep'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="ghost"
                    size="sm"
                    onClick={() => setMessage(suggestion)}
                    className="h-6 px-2 text-xs hover:bg-primary/10 rounded-full"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}