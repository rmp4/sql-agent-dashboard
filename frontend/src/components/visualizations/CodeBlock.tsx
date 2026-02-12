import { Card } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'sql' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
      <div className="text-xs text-muted-foreground mb-2 uppercase">{language}</div>
      <pre className="overflow-x-auto">
        <code className="text-sm font-mono">{code}</code>
      </pre>
    </Card>
  );
}
