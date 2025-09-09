import { InteractiveQuiz } from './InteractiveQuiz';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onTagClick?: (tag: string) => void;
}

export function MarkdownRenderer({ content, className = "", onTagClick }: MarkdownRendererProps) {
  // Check if content contains an interactive quiz
  const isQuizContent = content.includes('**Phase:**') && content.includes('**Question ') && content.includes('(easy|medium|hard)');
  
  if (isQuizContent) {
    // Parse quiz data from the markdown content
    const testData = parseQuizFromMarkdown(content);
    if (testData) {
      return <InteractiveQuiz testData={testData} />;
    }
  }
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip empty lines but add spacing
      if (!trimmedLine) {
        elements.push(<br key={key++} />);
        continue;
      }

      // Headers
      if (trimmedLine.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-xl font-bold text-primary mb-4 mt-4 first:mt-0">
            {trimmedLine.substring(2)}
          </h1>
        );
      } else if (trimmedLine.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-lg font-semibold text-primary mb-3 mt-4 first:mt-0">
            {trimmedLine.substring(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-base font-semibold text-foreground mb-2 mt-3">
            {trimmedLine.substring(4)}
          </h3>
        );
      }
      // Horizontal rule
      else if (trimmedLine === '---') {
        elements.push(
          <hr key={key++} className="my-4 border-t border-border" />
        );
      }
      // Bold text and regular paragraphs
      else {
        // Process hashtags separately to make them clickable
        const parts = trimmedLine.split(/(#\w+)/g);
        const formattedElements: JSX.Element[] = [];
        
        parts.forEach((part, index) => {
          if (part.match(/^#\w+$/)) {
            // This is a hashtag
            const tag = part.substring(1); // Remove the #
            formattedElements.push(
              <button
                key={`${key}-${index}`}
                onClick={() => onTagClick?.(tag)}
                className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium mr-1 cursor-pointer transition-colors"
                title={`Click to explore ${tag} topics`}
              >
                #{tag}
              </button>
            );
          } else {
            // Regular text with bold formatting
            const boldFormatted = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            if (boldFormatted.trim()) {
              formattedElements.push(
                <span 
                  key={`${key}-${index}`}
                  dangerouslySetInnerHTML={{ __html: boldFormatted }}
                />
              );
            }
          }
        });

        if (formattedElements.length > 0) {
          // Special styling for different types of test content
          const isAnswerChoice = trimmedLine.match(/^[A-D]\.\s/);
          const isCorrectAnswer = trimmedLine.startsWith('**Correct Answer:**');
          const isExplanation = trimmedLine.startsWith('**Explanation:**');
          const isTopicOrObjective = trimmedLine.startsWith('**Topic:**') || trimmedLine.startsWith('**Learning Objective:**');
          const isTimeOrScore = trimmedLine.startsWith('**Time Allowed:**') || trimmedLine.startsWith('**Passing Score:**') || trimmedLine.startsWith('**Questions:**');
          
          const className = isAnswerChoice 
            ? "mb-1 leading-relaxed pl-3 py-1 hover:bg-primary/5 rounded transition-colors cursor-pointer border-l-2 border-transparent hover:border-primary/20"
            : isCorrectAnswer
            ? "font-semibold text-green-700 dark:text-green-400 mb-2 leading-relaxed bg-green-50 dark:bg-green-950/20 p-2 rounded"
            : isExplanation
            ? "text-muted-foreground mb-3 leading-relaxed italic bg-blue-50 dark:bg-blue-950/20 p-3 rounded border-l-4 border-blue-200 dark:border-blue-800"
            : isTopicOrObjective
            ? "text-xs text-muted-foreground mb-1 leading-relaxed font-medium"
            : isTimeOrScore
            ? "text-sm font-medium mb-1 leading-relaxed"
            : "mb-2 leading-relaxed";
            
          elements.push(
            <p key={key++} className={className}>
              {formattedElements}
            </p>
          );
        }
      }
    }

    return elements;
  };

  return (
    <div className={`message-content ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
}

// Parse quiz data from markdown content
function parseQuizFromMarkdown(content: string): any {
  try {
    const lines = content.split('\n');
    let title = '';
    let phase = '';
    let week = 0;
    let totalQuestions = 0;
    let timeAllowed = 15;
    const questions: any[] = [];
    
    // Parse header info
    const headerMatch = content.match(/# (.+)/);
    if (headerMatch) title = headerMatch[1];
    
    const phaseMatch = content.match(/\*\*Phase:\*\* (\w+)/);
    if (phaseMatch) phase = phaseMatch[1];
    
    const weekMatch = content.match(/\*\*Week:\*\* (\d+)/);
    if (weekMatch) week = parseInt(weekMatch[1]);
    
    const questionsMatch = content.match(/\*\*Questions:\*\* (\d+)/);
    if (questionsMatch) totalQuestions = parseInt(questionsMatch[1]);
    
    const timeMatch = content.match(/\*\*Time:\*\* (\d+) minutes/);
    if (timeMatch) timeAllowed = parseInt(timeMatch[1]);
    
    // Parse questions
    const questionBlocks = content.split(/\*\*Question \d+\*\*/);
    questionBlocks.shift(); // Remove first empty element
    
    questionBlocks.forEach((block, index) => {
      const questionText = block.match(/^[^(]*(?=\()/)?.[0]?.trim();
      const difficulty = block.match(/\((easy|medium|hard)\)/)?.[1] || 'medium';
      
      // Extract options
      const optionMatches = block.match(/[A-D]\. .+/g);
      const options = optionMatches?.map(opt => opt.substring(3).replace(' ✓', '')) || [];
      
      // Find correct answer (look for checkmark or in feedback)
      let correctAnswer = 0;
      const correctMatch = block.match(/\*Correct Answer:\* ([A-D])/);
      if (correctMatch) {
        correctAnswer = correctMatch[1].charCodeAt(0) - 65; // Convert A,B,C,D to 0,1,2,3
      }
      
      // Extract explanations
      const explanationMatch = block.match(/\*Overall Explanation:\* (.+?)(?=\n|$)/);
      const explanation = explanationMatch?.[1]?.trim() || '';
      
      // Extract option feedback
      const optionFeedback: string[] = [];
      const feedbackMatches = block.match(/• \*\*[A-D]\.\*\* (.+)/g);
      if (feedbackMatches) {
        feedbackMatches.forEach(match => {
          const feedback = match.replace(/• \*\*[A-D]\.\*\* /, '');
          optionFeedback.push(feedback);
        });
      }
      
      if (questionText && options.length > 0) {
        questions.push({
          id: `q${index + 1}`,
          question: questionText,
          type: 'multiple-choice',
          options,
          correctAnswer,
          explanation,
          optionFeedback: optionFeedback.length > 0 ? optionFeedback : undefined,
          difficulty,
          topic: 'Curriculum Topic',
          learningObjective: 'Learning Objective'
        });
      }
    });
    
    if (questions.length > 0) {
      return {
        title: title || 'Practice Quiz',
        phase: phase || 'CHM',
        week: week || 1,
        totalQuestions: questions.length,
        questions,
        timeAllowed,
        passingScore: 70
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing quiz from markdown:', error);
    return null;
  }
}