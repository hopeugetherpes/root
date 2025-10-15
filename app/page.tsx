"use client"

import { useState } from "react"
import { TerminalHeader } from "@/components/terminal-header"
import { HeroTerminal } from "@/components/hero-terminal"
import { CodeRain } from "@/components/code-rain"
import { TerminalFooter } from "@/components/terminal-footer"

/**
 * HomePage Component
 *
 * Main landing page that creates a cyberpunk terminal interface experience.
 * Combines multiple visual elements to create an immersive hacker aesthetic:
 * - Matrix-style code rain background animation
 * - Interactive terminal with typing animations
 * - Dynamic header/footer that hide during special sequences
 *
 * State Management:
 * - showHeaderFooter: Controls visibility of header/footer during exit sequences
 */
export default function HomePage() {
  // State to control header/footer visibility during terminal exit sequences
  const [showHeaderFooter, setShowHeaderFooter] = useState(true)

  /**
   * Handles exit sequence triggers from the terminal
   * When terminal enters "exit" mode (like BSOD), hides header/footer for immersion
   *
   * @param isExiting - Boolean indicating if terminal is in exit/BSOD mode
   */
  const handleExitTriggered = (isExiting: boolean) => {
    setShowHeaderFooter(!isExiting)
  }

  return (
    <main className="relative">
      {/* Background matrix rain animation - renders behind all content */}
      <CodeRain />

      {/* Main content layer - positioned above the matrix rain */}
      <div className="relative z-10">
        {/* Terminal header - shows/hides based on terminal state */}
        <TerminalHeader isVisible={showHeaderFooter} />

        {/* Main interactive terminal component with typing animations */}
        <HeroTerminal onExitTriggered={handleExitTriggered} />
      </div>

      {/* Terminal footer - shows/hides based on terminal state */}
      <TerminalFooter isVisible={showHeaderFooter} />
    </main>
  )
}
