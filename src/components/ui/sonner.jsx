// src/components/ui/sonner.js
'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

const Toaster = (props) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="top-center"
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      }}
      {...props}
    />
  )
}

export { Toaster }
