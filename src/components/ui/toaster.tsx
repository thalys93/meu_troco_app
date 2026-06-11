import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProgress,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const DEFAULT_TOAST_DURATION_MS = 5000

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={DEFAULT_TOAST_DURATION_MS}>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        duration = DEFAULT_TOAST_DURATION_MS,
        variant,
        ...props
      }) {
        return (
          <Toast key={id} duration={duration} variant={variant} {...props}>
            <ToastProgress durationMs={duration} variant={variant} />
            <div className="grid w-full gap-1 pt-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
