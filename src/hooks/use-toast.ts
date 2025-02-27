
import { toast as sonnerToast, Toast } from "sonner"

type ToastType = "default" | "destructive" | "success" | "info" | "warning"

type ToastProps = {
  title?: string
  description?: string
  variant?: ToastType
  action?: React.ReactNode
}

export function toast({ title, description, variant = "default", action }: ToastProps) {
  const toastFn = variant === "destructive" 
    ? sonnerToast.error 
    : variant === "success" 
      ? sonnerToast.success 
      : variant === "info" 
        ? sonnerToast.info 
        : sonnerToast

  return toastFn(title, {
    description,
    action,
  })
}

export { toast as useToast }
