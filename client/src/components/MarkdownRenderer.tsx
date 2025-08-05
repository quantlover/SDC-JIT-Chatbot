interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
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
        const formattedText = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/#(\w+)/g, '<span class="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium mr-1">#$1</span>');

        elements.push(
          <p 
            key={key++} 
            className="mb-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
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