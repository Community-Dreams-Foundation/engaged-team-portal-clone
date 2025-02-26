
import { LucideIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MetricAlertProps {
  icon: LucideIcon
  title: string
  value: number
  description: string
  suffix?: string
}

export function MetricAlert({ icon: Icon, title, value, description, suffix = "" }: MetricAlertProps) {
  return (
    <Alert>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {value.toFixed(1)}{suffix} {description}
      </AlertDescription>
    </Alert>
  )
}

