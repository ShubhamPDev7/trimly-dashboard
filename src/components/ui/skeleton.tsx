import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("shimmer-bg animate-shimmer rounded-lg", className)}
      {...props}
    />
  )
}

export { Skeleton }