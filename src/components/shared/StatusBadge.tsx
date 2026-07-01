import { Badge } from "@/components/ui/badge"

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline" | "gold"
> = {
  PENDING: "warning",
  ACCEPTED: "secondary",
  COMPLETED: "success",
  REJECTED: "destructive",
  CANCELLED: "outline",
  WAITING: "warning",
  IN_PROGRESS: "secondary",
  NO_SHOW: "destructive",
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "outline"}>
      {status.replace("_", " ")}
    </Badge>
  )
}