/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { createHighlighter } from 'shiki';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface CodeBlockProps {
  html: string;
  code: string;
  language: string;
}

const CodeBlock = ({ html, code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg bg-[#1a1b26] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1b26]">
        <span className="text-sm text-[#888] font-mono">{language}</span>
        <CopyToClipboard text={code} onCopy={handleCopy}>
          <button 
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-md text-xs",
              "transition-colors duration-200",
              copied 
                ? "bg-emerald-500/10 text-emerald-400" 
                : "hover:bg-muted/30 text-[#888]"
            )}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied!</span>
              </>
            ) : (
              'Copy'
            )}
          </button>
        </CopyToClipboard>
      </div>
      <div 
        className="p-4 overflow-x-auto text-[15px] font-mono [&_pre]:!bg-transparent" 
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  );
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [highlighter, setHighlighter] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initHighlighter() {
      try {
        const hl = await createHighlighter({
          themes: ['github-dark'],
          langs: ['javascript', 'typescript', 'python','go', 'rust', 'rs', 'jsx', 'tsx', 'json', 'bash', 'markdown', 'css', 'html']
        });
        setHighlighter(hl);
      } catch (err) {
        setError('Failed to initialize syntax highlighter');
        console.error(err);
      }
    }
    initHighlighter();
  }, []);

  if (error) return <div className="text-destructive">Error: {error}</div>;
  if (!highlighter) return <div className="text-muted-foreground">Loading syntax highlighter...</div>;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const CodeComponent: Components['code'] = ({ inline, className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    
    // Handle LaTeX math blocks
    if (match && match[1] === 'math') {
      return <BlockMath math={String(children).trim()} />;
    }
    
    // Handle inline LaTeX
    if (inline && String(children).startsWith('$') && String(children).endsWith('$')) {
      const mathExpression = String(children).slice(1, -1);
      return <InlineMath math={mathExpression} />;
    }

    if (inline) {
      return <code className="bg-muted rounded px-1 py-0.5 text-foreground font-mono text-sm">{children}</code>;
    }

    const lang = match ? match[1] : 'text';
    const code = String(children);

    try {
      const html = highlighter.codeToHtml(code, {
        lang,
        theme: 'github-dark'
      });

      return (
        <CodeBlock 
          html={html}
          code={code}
          language={lang}
        />
      );
    } catch (err) {
      console.error(`Failed to highlight code block: ${err}`);
      return <code>{code}</code>;
    }
  };

  return (
    <ReactMarkdown
      className={cn(
        "prose prose-sm md:prose-base dark:prose-invert max-w-none",
        "prose-headings:scroll-mt-20 prose-headings:font-display",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-pre:border prose-pre:border-border",
        "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        className
      )}
      components={{
        h1: ({ ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 text-foreground" {...props} />,
        h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3 text-foreground" {...props} />,
        h3: ({ ...props }) => <h3 className="text-xl font-bold mt-4 mb-2 text-foreground" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 text-foreground" {...props} />,
        ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 text-foreground" {...props} />,
        li: ({ ...props }) => <li className="mb-1 text-foreground" {...props} />,
        p: ({ ...props }) => <p className="mb-4 last:mb-0 text-foreground" {...props} />,
        code: CodeComponent
      }}
    >
      {content}
    </ReactMarkdown>
  );
} 