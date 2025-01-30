import {
  Toast,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast"

import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            {title && <div className="grid gap-1">{title}</div>}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
            {action}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}