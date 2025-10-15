"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

/**
 * Props interface for the TerminalHeader component
 */
interface TerminalHeaderProps {
  /** Controls header visibility with smooth transitions */
  isVisible?: boolean
}

/**
 * TerminalHeader Component
 *
 * Displays a cyberpunk-styled header with:
 * - Real-time UTC clock
 * - Theme toggle (dark/light mode)
 * - Terminal-style branding
 * - Smooth show/hide animations
 *
 * Features:
 * - Updates time every second
 * - Backdrop blur effect for depth
 * - Responsive design
 * - Smooth transitions when hiding/showing
 */
export function TerminalHeader({ isVisible = true }: TerminalHeaderProps) {
  // === STATE MANAGEMENT ===

  /** Current UTC time string (HH:MM:SS format) */
  const [currentTime, setCurrentTime] = useState("")
  /** Current theme state (true = dark, false = light) */
  const [isDark, setIsDark] = useState(true)

  // === TIME UPDATE EFFECT ===
  useEffect(() => {
    /**
     * Updates the current time display with UTC time
     * Formats as HH:MM:SS with zero padding
     */
    const updateTime = () => {
      const now = new Date()
      const hours = now.getUTCHours().toString().padStart(2, "0")
      const minutes = now.getUTCMinutes().toString().padStart(2, "0")
      const seconds = now.getUTCSeconds().toString().padStart(2, "0")
      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }

    // Update immediately and then every second
    updateTime()
    const interval = setInterval(updateTime, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  // === THEME INITIALIZATION EFFECT ===
  useEffect(() => {
    // Set initial dark mode on component mount
    document.documentElement.classList.add("dark")
  }, [])

  /**
   * Toggles between dark and light themes
   * Updates both component state and document class
   */
  const toggleTheme = () => {
    setIsDark(!isDark)
    if (isDark) {
      // Switch to light mode
      document.documentElement.classList.remove("dark")
    } else {
      // Switch to dark mode
      document.documentElement.classList.add("dark")
    }
  }

  return (
    <header
      className={`border-b border-border bg-black/70 backdrop-blur-sm transition-all duration-2000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between font-mono text-sm">
          {/* Left side: Terminal prompt */}
          <div className="flex items-center gap-4">
            <span className="text-green-400 font-bold">root@anatole:~$</span>
          </div>

          {/* Right side: Time and theme toggle */}
          <div className="flex items-center gap-4">
            {/* UTC time display with tabular numbers for consistent width */}
            <span className="text-white font-mono tabular-nums">UTC {currentTime}</span>

            {/* Theme toggle button */}
            
          </div>
        </div>
      </div>
    </header>
  )
}
