import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type MarkdownContentProps = {
    content: string;
    className?: string;
    emptyFallback?: React.ReactNode;
};

function MarkdownContent({ content, className, emptyFallback = null }: MarkdownContentProps) {
    if (!content.trim()) {
        return emptyFallback ? <>{emptyFallback}</> : null;
    }

    return (
        <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
}

export { MarkdownContent };
