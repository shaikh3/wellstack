"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
      props.onChange?.(e)
    }

    return (
      <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
        <input
          type="checkbox"
          ref={ref}
          className="peer sr-only"
          onChange={handleChange}
          {...props}
        />
        <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-900 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-slate-400 peer-focus:ring-offset-2"
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
