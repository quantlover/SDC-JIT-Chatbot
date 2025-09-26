import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VoiceInput } from './VoiceInput';
import { FileUpload } from './FileUpload';
import { MessageReactions } from './MessageReactions';
import { ThemeToggle } from './ThemeToggle';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
  Send, 
  MessageSquare, 
  Bookmark, 
  BookmarkPlus,
  Search,
  Settings,
  BarChart3,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  Share
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  messageType?: 'chat' | 'file_upload' | 'voice';
  fileAttachments?: any[];
  audioTranscript?: string;
  responseTime?: number;
  createdAt: string;
}

interface Conversation {
  id: string;
  title?: string;
  userId?: string;
  tags?: string[];
  isBookmarked?: boolean;
  messageCount?: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function EnhancedChatWidget() {
  const [message, setMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [userId] = useState('demo-user-123'); // In real app, get from auth
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations for sidebar
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/users', userId, 'conversations'],
    enabled: !!userId,
  });

  // Fetch current conversation messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/conversations', currentConversationId, 'messages'],
    enabled: !!currentConversationId,
  });

  // Fetch user analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/user', userId],
    enabled: !!userId && showAnalytics,
  });

  // Search suggestions
  const { data: suggestions = [] } = useQuery({
    queryKey: ['/api/search/suggestions', { q: searchQuery }],
    enabled: searchQuery.length > 2,
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (chatData: any) => {
      const response = await apiRequest('POST', '/api/chat', chatData);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentConversationId(data.conversation.id);
      setMessage('');
      setUploadedFiles([]);
      
      // Replace temporary user message with real one and add assistant message
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => !msg.id.startsWith('temp-'));
        return [...withoutTemp, data.userMessage, data.assistantMessage];
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', data.conversation.id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'conversations'] });
      
      toast({
        title: "Message Sent",
        description: "Your message has been processed successfully.",
      });
    },
    onError: (error) => {
      // Remove temporary user message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Voice synthesis mutation
  const voiceMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'alloy' }),
      });
      
      if (!response.ok) throw new Error('Voice synthesis failed');
      
      const audioBlob = await response.blob();
      return audioBlob;
    },
    onSuccess: (audioBlob) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      
      // Clean up URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (bookmarkData: any) => {
      const response = await apiRequest('POST', '/api/bookmarks', bookmarkData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bookmarked",
        description: "Message has been saved to your bookmarks.",
      });
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && uploadedFiles.length === 0) return;

    const messageType = uploadedFiles.length > 0 ? 'file_upload' : 'chat';
    const messageContent = message || 'Shared files';

    // Add user message to local state immediately for better UX
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageContent,
      messageType,
      fileAttachments: uploadedFiles,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    chatMutation.mutate({
      message: messageContent,
      conversationId: currentConversationId,
      userId,
      messageType,
      fileAttachments: uploadedFiles,
    });
  };

  const handleVoiceTranscript = (transcript: string) => {
    setMessage(transcript);
  };

  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(files);
  };

  const handlePlayVoice = (text: string) => {
    if (!isVoiceEnabled) return;
    voiceMutation.mutate(text);
  };

  const handleBookmark = (messageId: string) => {
    bookmarkMutation.mutate({
      userId,
      messageId,
      conversationId: currentConversationId,
      title: 'Bookmarked Message',
    });
  };

  const handleTagClick = (tag: string) => {
    const tagQuery = `Tell me about CHM ${tag} topics`;
    setMessage(tagQuery);
    
    // Add user message to local state immediately for better UX
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: tagQuery,
      messageType: 'chat',
      fileAttachments: [],
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);
    
    chatMutation.mutate({
      message: tagQuery,
      conversationId: currentConversationId,
      userId,
      messageType: 'chat',
      fileAttachments: [],
    });
  };

  const createNewConversation = () => {
    setCurrentConversationId(null);
    setMessage('');
    setUploadedFiles([]);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Just In Time Medicine</h2>
            <ThemeToggle />
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <Button onClick={createNewConversation} size="sm" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <Button 
              onClick={() => setShowAnalytics(!showAnalytics)} 
              size="sm" 
              variant="ghost"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && analytics && (
          <div className="p-4 border-b border-border bg-muted/50">
            <h3 className="font-medium mb-2">Your Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Chats:</span>
                <Badge variant="secondary">{analytics.totalChats}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Bookmarks:</span>
                <Badge variant="secondary">{analytics.totalBookmarks}</Badge>
              </div>
              <div className="mt-2">
                <span className="text-muted-foreground">Favorite Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analytics.favoriteTopics.slice(0, 3).map((topic: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.map((conv: Conversation) => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={cn(
                "p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
                currentConversationId === conv.id && "bg-muted border-l-4 border-l-primary"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {conv.title || 'New Conversation'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {conv.messageCount || 0} messages
                  </p>
                  {conv.lastMessageAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatTime(conv.lastMessageAt)}
                    </p>
                  )}
                </div>
                {conv.isBookmarked && (
                  <Bookmark className="h-4 w-4 text-primary" />
                )}
              </div>
              
              {conv.tags && conv.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {conv.tags.slice(0, 2).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {currentConversationId ? 'Chat Session' : 'New Conversation'}
              </h3>
              <p className="text-sm text-muted-foreground">
                College of Human Medicine AI Assistant
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={isVoiceEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              >
                {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              
              {currentConversationId && (
                <>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messagesLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Welcome to Just In Time Medicine</h3>
              <p className="text-muted-foreground mb-4">
                Ask me about CHM curriculum, learning societies, clinical experiences, or any academic questions.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Learning Societies</Badge>
                <Badge variant="outline">M1 Curriculum</Badge>
                <Badge variant="outline">MCE Rotations</Badge>
                <Badge variant="outline">Clinical Skills</Badge>
              </div>
            </div>
          ) : (
            messages.map((msg: Message) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border'
                  )}
                >
                  <div className="space-y-2">
                    <MarkdownRenderer 
                      content={msg.content} 
                      className="text-sm leading-relaxed"
                      onTagClick={handleTagClick}
                    />
                    
                    {msg.fileAttachments && msg.fileAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.fileAttachments.map((file: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {file.originalName}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs opacity-70">
                      <span>{formatTime(msg.createdAt)}</span>
                      {msg.responseTime && (
                        <span>{msg.responseTime}ms</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Message Actions */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1">
                      {msg.role === 'assistant' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlayVoice(msg.content)}
                            disabled={!isVoiceEnabled || voiceMutation.isPending}
                            className="h-6 px-2"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(msg.id)}
                            className="h-6 px-2"
                          >
                            <BookmarkPlus className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {msg.role === 'assistant' && (
                      <MessageReactions 
                        messageId={msg.id} 
                        userId={userId}
                        disabled={chatMutation.isPending}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full typing-animation"></div>
                  <div className="w-2 h-2 bg-primary rounded-full typing-animation"></div>
                  <div className="w-2 h-2 bg-primary rounded-full typing-animation"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card">
          <FileUpload 
            onFileUpload={handleFileUpload}
            disabled={chatMutation.isPending}
          />
          
          <div className="flex items-end space-x-2 mt-3">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about CHM curriculum, learning societies, or any medical education topic..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={chatMutation.isPending}
                className="min-h-[40px]"
              />
            </div>
            
            <VoiceInput 
              onTranscript={handleVoiceTranscript}
              disabled={chatMutation.isPending}
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={chatMutation.isPending || (!message.trim() && uploadedFiles.length === 0)}
              size="sm"
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && searchQuery.length > 2 && (
            <div className="mt-2 p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.slice(0, 5).map((suggestion: string, index: number) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setMessage(suggestion)}
                    className="h-6 px-2 text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}