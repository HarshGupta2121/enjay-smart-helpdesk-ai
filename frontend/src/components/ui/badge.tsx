import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status Colors
        NEW: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        OPEN: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        PENDING: "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
        ON_HOLD: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        RESOLVED: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
        CLOSED: "border-transparent bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
        // Priority Colors
        LOW: "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        MEDIUM: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        HIGH: "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        URGENT: "border-transparent bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        CRITICAL: "border-transparent bg-rose-600 text-white dark:bg-rose-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }