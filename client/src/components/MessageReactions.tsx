import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Heart, Copy, Share } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface MessageReactionsProps {
  messageId: string;
  userId: string;
  disabled?: boolean;
  className?: string;
}

const reactionTypes = [
  { id: 'helpful', icon: ThumbsUp, label: 'Helpful' },
  { id: 'not_helpful', icon: ThumbsDown, label: 'Not Helpful' },
  { id: 'love', icon: Heart, label: 'Love' },
] as const;

export function MessageReactions({ 
  messageId, 
  userId, 
  disabled = false, 
  className 
}: MessageReactionsProps) {
  const [showAllReactions, setShowAllReactions] = useState(false);
  const queryClient = useQueryClient();

  // Fetch reactions for this message
  const { data: reactions = [] } = useQuery({
    queryKey: ['/api/reactions', messageId],
    enabled: !!messageId,
  });

  // Fetch user's reaction for this message
  const { data: userReaction } = useQuery({
    queryKey: ['/api/reactions', messageId, 'user', userId],
    enabled: !!messageId && !!userId,
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      const response = await apiRequest('POST', '/api/reactions', {
        messageId,
        userId,
        reactionType,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reactions', messageId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reactions', messageId, 'user', userId] });
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/reactions/${messageId}/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reactions', messageId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reactions', messageId, 'user', userId] });
    },
  });

  const handleReaction = (reactionType: string) => {
    if (disabled) return;

    if (userReaction?.reactionType === reactionType) {
      // Remove reaction if it's the same type
      removeReactionMutation.mutate();
    } else {
      // Add or change reaction
      addReactionMutation.mutate(reactionType);
    }
  };

  const copyMessage = async () => {
    // This would copy the message content to clipboard
    // In a real implementation, you'd pass the message content as a prop
    try {
      await navigator.clipboard.writeText('Message content would go here');
      // Show success toast
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const shareMessage = async () => {
    // This would implement message sharing
    // Could generate a shareable link or open share dialog
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CHM AI Assistant Response',
          text: 'Check out this helpful response from the CHM AI Assistant',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing message:', error);
      }
    } else {
      // Fallback to copying URL
      copyMessage();
    }
  };

  // Group reactions by type and count
  const reactionCounts = reactions.reduce((acc: Record<string, number>, reaction: any) => {
    acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {/* Reaction Buttons */}
      <div className="flex items-center space-x-1">
        {reactionTypes.map(({ id, icon: Icon, label }) => {
          const isActive = userReaction?.reactionType === id;
          const count = reactionCounts[id] || 0;
          
          return (
            <Button
              key={id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => handleReaction(id)}
              disabled={disabled || addReactionMutation.isPending || removeReactionMutation.isPending}
              className={cn(
                "h-7 px-2 text-xs",
                isActive && "bg-primary/20 text-primary border-primary/30"
              )}
              title={label}
            >
              <Icon className="h-3 w-3" />
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyMessage}
          disabled={disabled}
          className="h-7 px-2"
          title="Copy message"
        >
          <Copy className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={shareMessage}
          disabled={disabled}
          className="h-7 px-2"
          title="Share message"
        >
          <Share className="h-3 w-3" />
        </Button>
      </div>

      {/* Show detailed reactions */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllReactions(!showAllReactions)}
            className="h-7 px-2 text-xs text-muted-foreground"
          >
            {Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)} reactions
          </Button>
        </div>
      )}

      {/* Detailed reactions list (could be a popover in real implementation) */}
      {showAllReactions && reactions.length > 0 && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-popover border border-border rounded-md shadow-md z-10 min-w-[200px]">
          <div className="space-y-1">
            {reactionTypes.map(({ id, icon: Icon, label }) => {
              const typeReactions = reactions.filter((r: any) => r.reactionType === id);
              if (typeReactions.length === 0) return null;

              return (
                <div key={id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {typeReactions.length}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}