/* eslint-disable @typescript-eslint/no-explicit-any */
import { type VariantProps, cva } from "class-variance-authority";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";
import type { Control, ControllerRenderProps } from "react-hook-form";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Label } from "./label";
import { FormControl, FormField, FormItem, FormMessage } from "./form";

export interface BaseInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants> {
  label?: string;
  mask?: (value: string) => string;
  floatPlaceholder?: string;
  leftIcon?: React.ReactNode;
}

export type BaseCheckboxProps = BaseInputProps & {
  reverse?: boolean;
};

export type ControledInputProps = BaseInputProps & {
  name: string;
  control?: Control<any>;
  fieldType?: string;
};

export type NoControledInputProps = BaseInputProps & {
  name: never;
  control: never;
  fieldType: never;
};

export type InputProps = ControledInputProps | NoControledInputProps;

export type CheckboxProps = InputProps & {
  reverse?: boolean;
  width?: number;
};

type NumericProps = {
  inputMode?: InputProps["inputMode"];
  pattern?: InputProps["pattern"];
};

const inputVariants = cva(
  "flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-slate-300 bg-transparent border-slate-700/50",
        secondary:
          "bg-transparent text-secondary font-medium border border-slate-700 py-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  ({ className, type, label, required, leftIcon, variant, floatPlaceholder, ...props }, ref) => {
    const hasLeftIcon = !!leftIcon;

    return (
      <div className="w-full">
        {label ? (
          <Label htmlFor={props.id} variant={variant} className="mb-1.5">
            {label}
            <span className="font-bold text-red-500">
              {required ? "*" : ""}
            </span>
          </Label>
        ) : null}

        <div className="relative">
          {hasLeftIcon && (
            <div className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            ref={ref}
            required={required}
            {...props}
            className={cn(
              inputVariants({ variant, className }),
              hasLeftIcon ? "pl-10" : "",
              className
            )}
          />

          {floatPlaceholder && (
            <span className="absolute right-3 top-2/3 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none">
              {floatPlaceholder}
            </span>
          )}
        </div>
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ mask, control, name, fieldType, onChange, ...props }, ref) => {
    const numericNames = ["phone"];
    const numericProps: NumericProps | undefined = numericNames.includes(name)
      ? {
        inputMode: "numeric",
        pattern: ".*",
      }
      : undefined;

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      field?: ControllerRenderProps<any>
    ) => {
      const { value } = e.target;
      const formattedValue = props.type === "number" ? Number(value) : value;
      const fieldValue = mask ? mask(formattedValue.toString()) : formattedValue;

      field?.onChange(fieldValue);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {control ? (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormControl className="m-0">
                  <BaseInput
                    {...field}
                    {...numericProps}
                    {...props}
                    type={props.type}
                    ref={ref}
                    mask={mask}
                    onChange={(e) => handleChange(e, field)}
                    value={
                      fieldType === "object" && typeof field.value === "object"
                        ? JSON.stringify(field.value)
                        : field.value
                    }
                    leftIcon={props.leftIcon}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <BaseInput
            {...numericProps}
            {...props}
            ref={ref}
            mask={mask}
            onChange={(e) => handleChange(e)}
          />
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const eyeIconPosition = label ? "top-6" : "top-0.5";
    const { theme } = useTheme();

    return (
      <div className="relative">
        <Input
          {...props}
          type={showPassword ? "text" : "password"}
          className={cn("hide-password-toggle pr-10", className)}
          label={label}
          ref={ref}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`absolute right-0 ${eyeIconPosition} hover:bg-transparent`}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword && !props.disabled ? (
            <EyeOffIcon className={cn("h-5 w-5 fill-white", theme === "dark" && "fill-none")} aria-hidden="true" />
          ) : (
            <EyeIcon className={cn("h-5 w-5 fill-white", theme === "dark" && "fill-none")} aria-hidden="true" />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput };
