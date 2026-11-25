import * as React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import { FormControl, FormField, FormItem, FormMessage } from './form';
import type { Control, ControllerRenderProps } from 'react-hook-form';
import { cn } from '@/lib/utils';

export interface MarkdownEditorProps {
    name: string;
    control: Control<any>;
    placeholder?: string;
    className?: string;
    height?: number;
}

const MarkdownEditor = React.forwardRef<HTMLDivElement, MarkdownEditorProps>(
    ({ control, name, placeholder, className, height = 200 }, _ref) => {
        const { resolvedTheme } = useTheme();
        const colorMode = resolvedTheme === 'dark' ? 'dark' : 'light';
        return (
            <FormField
                control={control}
                name={name}
                render={({ field }: { field: ControllerRenderProps<any, string> }) => (
                    <FormItem>
                        <FormControl className="m-0">
                            <div data-color-mode={colorMode} className={cn('relative', className)}>
                                <MDEditor
                                    value={field.value ?? ''}
                                    onChange={(val) => field.onChange(val ?? '')}
                                    height={height}
                                    preview="live"
                                    placeholder={placeholder}
                                    visibleDragbar={false}
                                    className="bg-background/50 rounded-md border border-input"
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    }
);
MarkdownEditor.displayName = 'MarkdownEditor';

export { MarkdownEditor };
