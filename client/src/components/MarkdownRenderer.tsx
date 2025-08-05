interface MarkdownRendererProps {
  content: string;
  className?: string;
  onTagClick?: (tag: string) => void;
}

export function MarkdownRenderer({ content, className = "", onTagClick }: MarkdownRendererProps) {
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
      if (trimmedLine.startsWith('## ')) {
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
          elements.push(
            <p key={key++} className="mb-2 leading-relaxed">
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