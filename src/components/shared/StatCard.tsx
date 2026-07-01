import { motion } from "framer-motion"
import { Lock, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StatCard({
  icon: Icon,
  label,
  value,
  locked,
  hero,
  index = 0,
}: {
  icon: LucideIcon
  label: string
  value: string
  locked?: boolean
  /** hero = the one dark "ink" signature card per page, for the primary metric */
  hero?: boolean
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        "relative flex items-center gap-3 overflow-hidden rounded-2xl p-4 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-soft-lg)]",
        hero
          ? "bg-ink text-ink-foreground"
          : "border border-border/60 bg-card text-card-foreground"
      )}
    >
      {hero && (
        <div className="pointer-events-none absolute -right-6 -top-10 size-32 rounded-full bg-primary/25 blur-2xl" />
      )}
      <div
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-xl",
          hero ? "bg-white/10" : "bg-primary/10"
        )}
      >
        <Icon className={cn("h-4.5 w-4.5", hero ? "text-gold" : "text-primary")} />
      </div>
      <div className="relative min-w-0">
        <div
          className={cn(
            "text-[0.68rem] font-medium tracking-wide uppercase",
            hero ? "text-ink-foreground/60" : "text-muted-foreground"
          )}
        >
          {label}
        </div>
        <div className="flex items-center gap-1.5 text-xl font-semibold tracking-tight">
          {locked ? (
            <>
              <Lock className="h-3.5 w-3.5 opacity-70" />
              <span className={cn("text-sm font-medium", hero ? "text-ink-foreground/70" : "text-muted-foreground")}>
                PRO only
              </span>
            </>
          ) : (
            <span>{value}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}