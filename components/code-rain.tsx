"use client"

import { useEffect, useRef } from "react"

/**
 * CodeRain Component
 *
 * Creates a Matrix-style digital rain animation using HTML5 Canvas.
 * Renders falling characters in the background to create a cyberpunk atmosphere.
 *
 * Features:
 * - 60fps smooth animation (16.5ms intervals)
 * - Responsive canvas that adapts to window size
 * - Random character generation from alphanumeric + symbols
 * - Fade trail effect for realistic falling appearance
 * - Low opacity overlay that doesn't interfere with content
 * - Automatic cleanup on component unmount
 *
 * Performance:
 * - Uses requestAnimationFrame-equivalent timing for smooth rendering
 * - Efficient column-based drop system
 * - Minimal memory footprint with reused character array
 */
export function CodeRain() {
  /** Reference to the canvas element for direct manipulation */
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // === CANVAS SETUP ===

    // Set canvas to full viewport size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // === ANIMATION CONFIGURATION ===

    /** Character set for the falling rain - includes letters, numbers, and symbols */
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?"

    /** Font size in pixels - determines character size and column width */
    const fontSize = 14

    /** Number of columns based on canvas width and font size */
    const columns = canvas.width / fontSize

    /** Array tracking the Y position of each falling character column */
    const drops: number[] = []

    // Initialize each column's drop position
    for (let i = 0; i < columns; i++) {
      drops[i] = 1 // Start at top of screen
    }

    /**
     * Main animation draw function
     *
     * Renders the matrix rain effect by:
     * 1. Drawing a semi-transparent black overlay for fade trails
     * 2. Drawing random characters at each column's current position
     * 3. Moving each drop down by one row
     * 4. Resetting drops that reach the bottom (with random chance)
     */
    function draw() {
      if (!ctx || !canvas) return

      // === FADE TRAIL EFFECT ===
      // Draw semi-transparent black rectangle to create fading trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)" // Very low opacity for smooth fade
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // === CHARACTER RENDERING ===
      ctx.fillStyle = "#00ff41" // Classic Matrix green color
      ctx.font = `${fontSize}px monospace` // Monospace font for consistent spacing

      // Draw each column's character
      for (let i = 0; i < drops.length; i++) {
        // Select random character from character set
        const text = chars[Math.floor(Math.random() * chars.length)]

        // Draw character at column position and current drop height
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        // === DROP MOVEMENT LOGIC ===
        // Reset drop to top when it reaches bottom (with 2.5% random chance)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0 // Reset to top
        }

        // Move drop down by one row
        drops[i]++
      }
    }

    // === ANIMATION LOOP ===
    // Run at 60fps (16.5ms intervals) for smooth animation
    const interval = setInterval(draw, 16.5) // Doubled speed from 33ms to 16.5ms

    /**
     * Handles window resize events
     * Recalculates canvas dimensions to maintain full-screen coverage
     */
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Add resize listener for responsive behavior
    window.addEventListener("resize", handleResize)

    // === CLEANUP ===
    return () => {
      clearInterval(interval) // Stop animation loop
      window.removeEventListener("resize", handleResize) // Remove event listener
    }
  }, []) // Empty dependency array - run once on mount

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30 z-0"
      aria-hidden="true" // Hide from screen readers as it's decorative
    />
  )
}
