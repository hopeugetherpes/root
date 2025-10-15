"use client"

/**
 * Props interface for the TerminalFooter component
 */
interface TerminalFooterProps {
  /** Controls footer visibility with smooth transitions */
  isVisible?: boolean
}

/**
 * TerminalFooter Component
 *
 * Displays a cyberpunk-styled footer with:
 * - Copyright and branding information
 * - Creator attribution
 * - Smooth show/hide animations
 * - Fixed positioning at bottom of screen
 *
 * Features:
 * - Backdrop blur effect for depth
 * - Responsive design
 * - Smooth transitions when hiding/showing
 * - Terminal-style typography
 */
export function TerminalFooter({ isVisible = true }: TerminalFooterProps) {
  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 border-t border-border bg-black/70 backdrop-blur-sm z-20 transition-all duration-2000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex flex-col items-center justify-center gap-2 font-mono text-sm">
          <a
            href="https://github.com/hopeugetherpes/root"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 transition-colors"
            aria-label="View source on GitHub"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <span className="text-muted-foreground">
            <span className="text-green-400 font-bold">⿻ 1N73LLIG3NC3 15 7H3 4BILI7Y 70 4D4P7 70 CHANG3 ⿻</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
