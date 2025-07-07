/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "./form";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  name: string;
  required?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  control?: any;
}

const BaseTextArea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, required, ...props }, ref) => (
    <>
      {label ? (
        <Label htmlFor={props.id} className="mb-1.5">
          {label}
          <span className="font-bold text-red-500">{required ? "*" : ""}</span>
        </Label>
      ) : null}
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    </>
  )
);
BaseTextArea.displayName = "BaseTextArea";

const TextArea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ control, name, onChange, ...props }, ref) => {
    const handleChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      field?: ControllerRenderProps<any>
    ) => {
      const { value } = e.target;

      field?.onChange(value);
      onChange?.(e);
    };

    return (
      <div>
        {control ? (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormControl className="m-0">
                  <BaseTextArea
                    {...field}
                    {...props}
                    ref={ref}
                    onChange={(e) => handleChange(e, field)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <BaseTextArea
            {...props}
            ref={ref}
            name={name}
            onChange={(e) => handleChange(e)}
          />
        )}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

export { TextArea };
