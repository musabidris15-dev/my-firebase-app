"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// FIX: Use React.ComponentProps to automatically get the right types
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
