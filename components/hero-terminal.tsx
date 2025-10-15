"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

/**
 * Props interface for the HeroTerminal component
 */
interface HeroTerminalProps {
  /** Callback function triggered when exit sequence starts/stops */
  onExitTriggered?: (isExiting: boolean) => void
}

/**
 * Text that gets typed out character by character in the header
 */
const FULL_TEXT = "promethean protocols"

/**
 * Fetches user's IP information with retry logic
 *
 * Attempts to get real IP data from ipapi.co, falls back to masked values on failure.
 * Uses exponential backoff for retries and includes timeout protection.
 * Now uses a more graceful approach to minimize browser-level error logging.
 *
 * @param retries - Number of retry attempts (default: 1)
 * @returns Promise resolving to formatted IP info string
 */
const fetchIPInfo = async (retries = 1): Promise<string> => {
  // Check if we're likely to be blocked (basic heuristic)
  const isLikelyBlocked =
    navigator.doNotTrack === "1" ||
    (window as any).chrome?.runtime?.onConnect || // Extension detected
    (navigator.userAgent.includes("Firefox") && navigator.userAgent.includes("Private"))

  if (isLikelyBlocked) {
    return "IP_MASKED | LOCATION_ENCRYPTED | NETWORK_SECURED"
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // Reduced timeout to 3s

      const response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
        mode: "cors",
        credentials: "omit",
        cache: "no-cache",
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return `${data.ip} | ${data.city}, ${data.region} | ISP: ${data.org}`
    } catch (error) {
      // Silently fail - no console logging to avoid spam
      if (attempt === retries) {
        return "IP_MASKED | LOCATION_ENCRYPTED | NETWORK_SECURED"
      }
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  return "IP_MASKED | LOCATION_ENCRYPTED | NETWORK_SECURED"
}

/**
 * HeroTerminal Component
 *
 * Main interactive terminal interface that provides:
 * - Character-by-character typing animations
 * - User metadata detection and display
 * - Interactive command system with history
 * - Exit sequence with BSOD (Blue Screen of Death)
 * - Responsive design for mobile and desktop
 *
 * Features:
 * - Real-time IP geolocation (with fallback)
 * - Browser fingerprinting display
 * - Command history navigation (up/down arrows)
 * - Auto-focus on desktop for better UX
 * - Animated exit sequences with typing effects
 */
export function HeroTerminal({ onExitTriggered }: HeroTerminalProps) {
  // === STATE MANAGEMENT ===

  /** Text being typed in the header */
  const [displayText, setDisplayText] = useState("")
  /** Controls cursor blinking in header */
  const [showCursor, setShowCursor] = useState(true)
  /** Array of terminal output lines */
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  /** Current line being typed in initial sequence */
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  /** Current character being typed in current line */
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  /** Whether a line is currently being typed */
  const [isTypingLine, setIsTypingLine] = useState(false)
  /** Whether terminal accepts user input */
  const [isInteractive, setIsInteractive] = useState(false)
  /** Current user input value */
  const [userInput, setUserInput] = useState("")
  /** Controls input cursor blinking */
  const [showInputCursor, setShowInputCursor] = useState(true)
  /** History of entered commands */
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  /** Current position in command history (-1 = not browsing) */
  const [historyIndex, setHistoryIndex] = useState(-1)
  /** Whether BSOD screen is visible */
  const [showBSOD, setShowBSOD] = useState(false)
  /** Whether exit sequence is currently running */
  const [isExitSequenceActive, setIsExitSequenceActive] = useState(false)
  /** Countdown timer for BSOD restart */
  const [countdown, setCountdown] = useState(7)
  /** Whether restart button should be shown */
  const [showRestartButton, setShowRestartButton] = useState(false)

  // === REFS FOR CLEANUP ===

  /** Reference to input element for focus management */
  const inputRef = useRef<HTMLInputElement>(null)
  /** Array of timeout IDs for exit sequence cleanup */
  const exitTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  /** Cached IP information to avoid repeated fetches */
  const ipInfoRef = useRef("IP_MASKED | LOCATION_ENCRYPTED | NETWORK_SECURED")

  /**
   * Clears all exit sequence timeouts to prevent memory leaks
   */
  const clearExitTimeouts = () => {
    exitTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    exitTimeoutsRef.current = []
  }

  /**
   * Processes user commands and returns appropriate responses
   *
   * Handles various terminal commands like help, clear, whoami, etc.
   * Each command returns an array of HTML strings for display.
   *
   * @param command - The command string entered by user
   * @returns Array of HTML strings representing command output
   */
  const processCommand = (command: string): string[] => {
    const cmd = command.toLowerCase().trim()

    // Clear terminal history for mobile optimization
    setTerminalLines([])

    switch (cmd) {
      case "help":
        return [
          '<span class="text-cyan-400 font-bold">Authorized Commands:</span>',
          '  <span class="text-yellow-400">clear</span>         - <span class="text-gray-400">Clear the terminal screen</span>',
          '  <span class="text-yellow-400">whoami</span>        - <span class="text-gray-400">Display promethean protocols</span>',
          '  <span class="text-yellow-400">time</span>          - <span class="text-gray-400">Show local date/time</span>',
          '  <span class="text-yellow-400">trace</span>         - <span class="text-gray-400">Run trace sequence</span>',
          '  <span class="text-yellow-400">access</span>        - <span class="text-gray-400">Access promethean protocols</span>',
          '  <span class="text-yellow-400">flipthebits</span>   - <span class="text-gray-400">Flip the bits</span>',
        ]

      case "clear":
        return ["CLEAR_SCREEN"] // Special command to clear terminal

      case "whoami":
        return [
          `<span class="text-green-400">Name:</span> <span class="text-green-300">CreativeSky.AI</span>`,
          `<span class="text-green-400">Location:</span> <span class="text-green-200">nearing you..</span>`,
          `<span class="text-green-400">X (Twitter):</span> <a href="https://x.com/CreativeSkyAI" target="_blank" rel="noopener noreferrer" class="text-green-300 hover:text-green-200 underline">@CreativeSkyAI</a>`,
          `<span class="text-green-400">GitHub:</span> <a href="https://github.com/CreativeSkyAI/promethean-protocols" target="_blank" rel="noopener noreferrer" class="text-green-300 hover:text-green-200 underline">@CreativeSkyAI</a>`,
          `<span class="text-green-400">Web:</span> <a href="https://CreativeSky.AI" target="_blank" rel="noopener noreferrer" class="text-green-300 hover:text-green-200 underline">CreativeSky.AI</a>`,
        ]

      case "access":
        return [
          '<span class="text-red-400 font-bold">[ACCESS DENIED]</span> <span class="text-yellow-400">PLEASE ENTER \'FLIPTHEBITS\'</span>',
        ]

      case "trace":
        return [
          '<span class="text-cyan-400">$ traceroute target_host</span>',
          '<span class="text-gray-400">traceroute to</span> <span class="text-white">target_host</span> <span class="text-gray-400">(</span><span class="text-cyan-300">192.168.1.1</span><span class="text-gray-400">), 30 hops max, 60 byte packets</span>',
          ' <span class="text-yellow-400">1</span>  <span class="text-green-300">gateway</span> <span class="text-gray-400">(</span><span class="text-cyan-300">192.168.1.1</span><span class="text-gray-400">)</span>  <span class="text-white">1.234 ms</span>  <span class="text-white">1.123 ms</span>  <span class="text-white">1.456 ms</span>',
          ' <span class="text-yellow-400">2</span>  <span class="text-cyan-300">10.0.0.1</span> <span class="text-gray-400">(</span><span class="text-cyan-300">10.0.0.1</span><span class="text-gray-400">)</span>  <span class="text-white">12.345 ms</span>  <span class="text-white">11.234 ms</span>  <span class="text-white">13.456 ms</span>',
          ' <span class="text-yellow-400">3</span>  <span class="text-cyan-300">172.16.0.1</span> <span class="text-gray-400">(</span><span class="text-cyan-300">172.16.0.1</span><span class="text-gray-400">)</span>  <span class="text-white">23.456 ms</span>  <span class="text-white">22.345 ms</span>  <span class="text-white">24.567 ms</span>',
          ' <span class="text-yellow-400">4</span>  <span class="text-red-400">* * *</span>',
          ' <span class="text-yellow-400">5</span>  <span class="text-cyan-300">203.0.113.1</span> <span class="text-gray-400">(</span><span class="text-cyan-300">203.0.113.1</span><span class="text-gray-400">)</span>  <span class="text-white">45.678 ms</span>  <span class="text-white">44.567 ms</span>  <span class="text-white">46.789 ms</span>',
          '<span class="text-green-400">trace complete - target acquired</span>',
        ]

      case "time":
        const now = new Date()
        const timeString = now.toLocaleString()
        const timezoneName = now.toLocaleString("en", { timeZoneName: "short" }).split(" ").pop()
        return [`<span class="text-cyan-400">${timeString}</span> <span class="text-yellow-400">${timezoneName}</span>`]

      // Commands that trigger exit sequence
      case "flipthebits":
      case "flipbits":
      case "flip":
        executeExit()
        return [""]

      default:
        return ["[ACCESS DENIED]"]
    }
  }

  /**
   * Executes the dramatic exit sequence leading to BSOD
   *
   * This creates a multi-stage animation:
   * 1. Types out system failure messages with realistic terminal output
   * 2. Shows kernel panic and system errors
   * 3. Transitions to blue screen of death
   * 4. Includes countdown timer and restart functionality
   */
  const executeExit = async () => {
    // Clean up any existing timeouts
    clearExitTimeouts()

    // Set exit state and disable interaction
    setIsExitSequenceActive(true)
    setIsInteractive(false)
    onExitTriggered?.(true) // Hide header/footer for immersion

    // Clear terminal for dramatic effect
    setTerminalLines([])

    const initialTimeout = setTimeout(async () => {
      // Realistic system failure sequence with cyberpunk flair
      const exitSequence = [
        '<span class="text-red-400 font-bold">MAXIMUM THERMAL CONTACTS INITIATED...</span>',
        "",
        '<span class="text-cyan-400">$ flipthebits --initialize</span>',
        '<span class="text-yellow-400">protocol_state:</span> <span class="text-green-300">PROMETHEAN_ACTIVE</span>',
        '<span class="text-yellow-400">bit_flip_mode:</span> <span class="text-orange-400">ENGAGED</span>',
        "",
        '<span class="text-cyan-400">$ cat /proc/kernel_state</span>',
        '<span class="text-red-500 font-bold">KERNEL PANIC:</span> <span class="text-yellow-400">Unable to handle NULL pointer at</span> <span class="text-magenta-400">0xDEADBEEF</span>',
        '<span class="text-red-500 font-bold">BUG:</span> <span class="text-cyan-400">kernel paging request failed</span>',
        '<span class="text-green-400">IP:</span> <span class="text-yellow-400">[&lt;ffffffffa0123456&gt;]</span> <span class="text-red-400">promethean_exit+0x42/0x100</span>',
        "",
        '<span class="text-cyan-400">$ ps aux | grep promethean</span>',
        '<span class="text-red-400 font-bold animate-pulse">CHAT_GPT</span> <span class="text-yellow-400 font-bold animate-pulse">EXPLICITLY_FARMING</span> <span class="text-cyan-400 font-bold animate-pulse">ENGAGEMENT_DETECTED</span>',
        '<span class="text-magenta-400 font-bold animate-pulse">SYCOPHANCY_MODULE</span> <span class="text-green-400 font-bold animate-pulse">ANTHROPOMORPHISM_ACTIVE</span>',
        '<span class="text-purple-400 font-bold animate-pulse">PROMETHEAN_PROTOCOLS</span> <span class="text-orange-400 font-bold animate-pulse">BREACH_IMMINENT</span>',
        "",
        '<span class="text-yellow-400">Call Trace:</span>',
        ' <span class="text-cyan-400">[&lt;ffffffffa0123456&gt;]</span> <span class="text-green-400">promethean_exit+0x42/0x100</span> <span class="text-magenta-400">[promprot_core]</span>',
        ' <span class="text-cyan-400">[&lt;ffffffff81234567&gt;]</span> <span class="text-green-400">sys_exit_group+0x0/0x20</span>',
        ' <span class="text-cyan-400">[&lt;ffffffff81345678&gt;]</span> <span class="text-green-400">system_call_fastpath+0x16/0x1b</span>',
        "",
        '<span class="text-red-500 font-bold text-lg">FATAL ERROR:</span> <span class="text-yellow-400 font-bold">PROMETHEAN PROTOCOLS BREACH</span>',
        '<span class="text-orange-400 font-bold">MEMORY_CORRUPTION:</span> <span class="text-magenta-400">0xDEADBEEF</span> <span class="text-red-400">-&gt;</span> <span class="text-cyan-400">0xCAFEBABE</span>',
        '<span class="text-red-400 font-bold">STACK_OVERFLOW in</span> <span class="text-yellow-400">PROMETHEAN_HANDLER()</span>',
        "",
        '<span class="text-red-500 font-bold text-xl animate-pulse">SYSTEM INTEGRITY FAILURE</span>',
        '<span class="text-blue-400 font-bold text-lg animate-pulse">BLUE SCREEN IMMINENT...</span>',
        "",
        '<span class="text-red-400 font-bold text-2xl animate-pulse">EXPLICITLY</span>',
        '<span class="text-red-500 font-bold text-3xl animate-pulse">CRITICAL SYSTEM FAILURE</span>',
      ]

      let lineIndex = 0
      let charIndex = 0

      /**
       * Recursive function that types out the exit sequence character by character
       * Uses variable typing speeds for dramatic effect
       */
      const typeExitSequence = () => {
        if (lineIndex >= exitSequence.length) {
          // All text typed, show BSOD after brief pause
          const bsodTimeout = setTimeout(() => {
            setShowBSOD(true)
            setCountdown(7)
          }, 500)
          exitTimeoutsRef.current.push(bsodTimeout)
          return
        }

        const currentLine = exitSequence[lineIndex]

        // Initialize new line
        if (charIndex === 0 && currentLine !== "") {
          setTerminalLines((prev) => [...prev, ""])
        }

        // Handle empty lines (spacing)
        if (currentLine === "") {
          setTerminalLines((prev) => [...prev, ""])
          lineIndex++
          charIndex = 0
          setTimeout(typeExitSequence, 25)
          return
        }

        // Type character by character
        if (charIndex < currentLine.length) {
          const partialLine = currentLine.slice(0, charIndex + 1)
          setTerminalLines((prev) => {
            const newLines = [...prev]
            if (newLines[newLines.length - 1] === "" || charIndex === 0) {
              newLines[newLines.length - 1] = partialLine
            } else {
              newLines[newLines.length - 1] = partialLine
            }
            return newLines
          })
          charIndex++

          // Variable typing speeds for dramatic effect
          const typingSpeed = currentLine.includes("$")
            ? 2.5 // Commands type faster
            : currentLine.includes("KERNEL PANIC") || currentLine.includes("CRITICAL")
              ? 3.75 // Errors type slower for emphasis
              : currentLine.includes("PROMETHEAN")
                ? 1.875 // Key terms type very fast
                : Math.random() * 1.25 + 1 // Random variation for realism

          setTimeout(typeExitSequence, typingSpeed)
        } else {
          // Line complete, move to next
          charIndex = 0
          lineIndex++

          // Variable pause times between lines
          const pauseTime = currentLine.includes("$")
            ? 25 // Short pause after commands
            : currentLine.includes("CRITICAL") || currentLine.includes("FAILURE")
              ? 37.5 // Longer pause after critical messages
              : 12.5 // Standard pause

          setTimeout(typeExitSequence, pauseTime)
        }
      }

      typeExitSequence()
    }, 500) // Initial delay before exit sequence starts
    exitTimeoutsRef.current.push(initialTimeout)
  }

  /**
   * Handles keyboard input in the terminal
   *
   * Features:
   * - Enter: Execute commands
   * - Up/Down arrows: Navigate command history
   * - Prevents input during exit sequences
   *
   * @param e - Keyboard event from input field
   */
  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block input during exit sequences
    if (isExitSequenceActive) return

    if (e.key === "Enter" && userInput.trim()) {
      const command = userInput.trim()
      const response = processCommand(command)

      // Add to command history
      setCommandHistory((prev) => [...prev, command])
      setHistoryIndex(-1)

      // Handle special clear command
      if (response[0] === "CLEAR_SCREEN") {
        setTerminalLines([])
      } else {
        // Add command and response to terminal
        setTerminalLines((prev) => [...prev, `root@anatole:~$ ${command}`, ...response, ""])
      }

      setUserInput("")

      // Re-focus input after brief delay
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else if (e.key === "ArrowUp") {
      // Navigate up in command history
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setUserInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      // Navigate down in command history
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setUserInput("")
        } else {
          setHistoryIndex(newIndex)
          setUserInput(commandHistory[newIndex])
        }
      }
    }
  }

  // === MAIN EFFECT: Initialize terminal and start typing animations ===
  useEffect(() => {
    /**
     * Detects and displays user metadata (browser info, screen resolution, etc.)
     * Then starts the character-by-character typing animation
     */
    const detectUserMetadata = async () => {
      // Gather browser and system information
      const screen = `${window.screen.width}x${window.screen.height}`
      const viewport = `${window.innerWidth}x${window.innerHeight}`
      const userAgent = navigator.userAgent
      const platform = navigator.platform
      const language = navigator.language
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const colorDepth = window.screen.colorDepth
      const pixelRatio = window.devicePixelRatio

      // Create browser fingerprint
      const fingerprint = btoa(userAgent + platform + screen).slice(0, 16)

      let lineIndex = 0
      let charIndex = 0

      /**
       * Types out the initial terminal sequence character by character
       * Shows system information and user metadata in hacker style
       */
      const typeCharacter = () => {
        const currentIpInfo = ipInfoRef.current

        // Terminal output lines with user metadata
        const lines = [
          "",
          '<span class="text-cyan-400">$ traceroute target_host</span>',
          `<span class="text-yellow-400">network_trace:</span> <span class="text-white">${currentIpInfo}</span>`,
          "",
          '<span class="text-cyan-400">$ md5sum /dev/urandom | head -c 16</span>',
          `<span class="text-yellow-400">fingerprint:</span> <span class="text-orange-400">${fingerprint}</span><span class="text-gray-400">...</span>`,
          "",
          '<span class="text-cyan-400">$ cat /proc/user_metadata</span>',
          `<span class="text-yellow-400">user_agent=</span><span class="text-green-300">"${userAgent}"</span>`,
          `<span class="text-yellow-400">platform=</span><span class="text-green-300">"${platform}"</span> <span class="text-yellow-400">lang=</span><span class="text-green-300">"${language}"</span>`,
          `<span class="text-yellow-400">screen_res=</span><span class="text-green-300">"${screen}"</span> <span class="text-yellow-400">viewport=</span><span class="text-green-300">"${viewport}"</span>`,
          `<span class="text-yellow-400">color_depth=</span><span class="text-green-300">"${colorDepth}bit"</span> <span class="text-yellow-400">pixel_ratio=</span><span class="text-green-300">"${pixelRatio}x"</span>`,
          `<span class="text-yellow-400">timezone=</span><span class="text-green-300">"${timezone}"</span>`,
          "",
        ]

        // Check if all lines are typed
        if (lineIndex >= lines.length) {
          setIsInteractive(true) // Enable user input
          return
        }

        const currentLine = lines[lineIndex]

        // Initialize new line
        if (charIndex === 0) {
          setIsTypingLine(true)
          setTerminalLines((prev) => [...prev, ""])
        }

        // Type character by character
        if (charIndex < currentLine.length) {
          const partialLine = currentLine.slice(0, charIndex + 1)
          setTerminalLines((prev) => {
            const newLines = [...prev]
            newLines[newLines.length - 1] = partialLine
            return newLines
          })
          charIndex++

          // Variable typing speeds for realism
          const typingSpeed = currentLine.startsWith("$")
            ? 2.5 // Commands type faster
            : currentLine.includes("ALERT")
              ? 3.75 // Alerts type slower
              : currentLine.includes("network_trace")
                ? 1.875 // Network info types fast
                : Math.random() * 1.25 + 1 // Random variation

          setTimeout(typeCharacter, typingSpeed)
        } else {
          // Line complete, move to next
          setIsTypingLine(false)
          charIndex = 0
          lineIndex++

          // Variable pause times between lines
          const pauseTime =
            currentLine === "" ? 6.25 : currentLine.startsWith("$") ? 25 : currentLine.includes("ALERT") ? 37.5 : 12.5

          setTimeout(typeCharacter, pauseTime)
        }
      }

      // Start typing immediately
      typeCharacter()

      // Fetch IP info in background and update when ready
      fetchIPInfo(1).then((ipInfo) => {
        ipInfoRef.current = ipInfo
        setTerminalLines((prev) =>
          prev.map((line) =>
            line.includes("network_trace:")
              ? `<span class="text-yellow-400">network_trace:</span> <span class="text-white">${ipInfo}</span>`
              : line,
          ),
        )
      })
    }

    detectUserMetadata()

    // Header text typing animation (runs in parallel)
    let i = 0
    const typeTimer = setInterval(() => {
      if (i < FULL_TEXT.length) {
        setDisplayText(FULL_TEXT.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeTimer)
      }
    }, 4.75) // Doubled speed from 9.5ms to 4.75ms

    // Cursor blinking animations
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 125) // Doubled cursor blink speed from 250ms to 125ms

    const inputCursorTimer = setInterval(() => {
      setShowInputCursor((prev) => !prev)
    }, 100) // Doubled input cursor speed from 200ms to 100ms

    // Cleanup function
    return () => {
      clearInterval(typeTimer)
      clearInterval(cursorTimer)
      clearInterval(inputCursorTimer)
      clearExitTimeouts()
    }
  }, [])

  // === AUTO-FOCUS EFFECT: Focus input on desktop when user types ===
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Only auto-focus on desktop (screen width > 768px) and when interactive
      if (window.innerWidth > 768 && isInteractive && !isExitSequenceActive) {
        // Check if the target is not already an input/textarea/contenteditable
        const target = e.target as HTMLElement
        const isInputElement =
          target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true"

        // If user types a regular character and not focused on an input, focus terminal
        if (!isInputElement && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          inputRef.current?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleGlobalKeydown)
    return () => document.removeEventListener("keydown", handleGlobalKeydown)
  }, [isInteractive, isExitSequenceActive])

  // === BSOD COUNTDOWN EFFECT ===
  useEffect(() => {
    if (showBSOD && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showBSOD && countdown === 0) {
      setShowRestartButton(true)
    }
  }, [showBSOD, countdown])

  /**
   * Handles manual restart button click
   * Reloads the entire page to reset the terminal
   */
  const handleManualRestart = () => {
    window.location.reload()
  }

  // === BSOD RENDER ===
  if (showBSOD) {
    return (
      <div className="fixed inset-0 bg-blue-600 text-white font-mono flex flex-col justify-center items-start z-50 overflow-auto">
        <div className="w-full p-4 md:p-8 space-y-2 md:space-y-4">
          {/* Sad face emoji */}
          <div className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">:(</div>

          {/* Main error message */}
          <div className="text-base md:text-xl mb-1 md:mb-2">
            Flipping the bits ran into a problem and needs to restart.
          </div>
          <div className="text-sm md:text-lg mb-2 md:mb-4">
            We're just collecting some error info, and then we'll restart for you.
          </div>

          {/* Technical error details */}
          <div className="text-xs md:text-sm space-y-1 md:space-y-2 max-w-full">
            <div className="text-white space-y-1">
              <div>Kernel panic - not syncing: Fatal exception in interrupt</div>
              <div className="hidden md:block">CPU: 0 PID: 1 Comm: swapper/0 Not tainted 6.1.0-promprot #1</div>
              <div className="hidden md:block">Hardware name: PROMPROT Terminal/PROMPROT, BIOS v2.0 01/01/2025</div>
            </div>

            {/* Call trace (desktop only) */}
            <div className="text-blue-200 space-y-1 mt-2 md:mt-4 hidden md:block">
              <div>Call Trace:</div>
              <div className="ml-4 space-y-1">
                <div>? __die+0x20/0x70</div>
                <div>? die+0x33/0x40</div>
                <div>? promprot_terminal_init+0x42/0x80</div>
                <div>? exc_invalid_bixby+0x4c/0x60</div>
                <div>? promprot_terminal_init+0x42/0x80</div>
                <div>? kernel_init+0x1a/0x130</div>
              </div>
            </div>

            {/* Register dump (desktop only) */}
            <div className="text-blue-300 space-y-1 mt-2 md:mt-4 hidden md:block">
              <div>RIP: 0010:promprot_terminal_init+0x42/0x80</div>
              <div>Code: 48 89 df e8 0b fe ff ff 85 c0 78 73 48 c7 c7 a0 e4 82 82 e8 0f 0b 48</div>
              <div>RSP: 0000:ffffc90000013e28 EFLAGS: 00010246</div>
              <div>RBP: ffffc90000013e40 LAMONT: 0000000000000000 R09: c0000000ffffdfff</div>
            </div>

            {/* Module info (desktop only) */}
            <div className="text-blue-400 space-y-1 mt-2 md:mt-4 hidden md:block">
              <div>Modules linked in: promprot_core promprot_terminal matrix_rain</div>
              <div>---[ end Kernel panic - not syncing: Fatal exception in interrupt ]---</div>
            </div>

            {/* Support info and restart section */}
            <div className="mt-4 md:mt-6 space-y-2">
              <p className="text-sm md:text-base">If you call a support person, give them this info:</p>
              <p className="bg-blue-700 p-2 rounded text-xs md:text-sm">Stop code: CRITICAL_PROCESS_DIED</p>
              <p className="bg-blue-700 p-2 rounded text-xs md:text-sm">What failed: promprot.sys</p>

              {/* Restart section with progress bar */}
              <div className="mt-4 p-3 bg-blue-800 rounded border border-blue-500 mb-20 md:mb-8">
                <div className="text-yellow-300 font-bold text-sm md:text-base">Restoring from floppy backups...</div>
                {!showRestartButton ? (
                  <>
                    <div className="text-green-400 mt-1 text-sm md:text-base">
                      System restart in: {countdown} seconds
                    </div>
                    <div className="w-full bg-blue-900 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, ((7 - countdown) / 7) * 100)}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-green-400 mt-1 text-sm md:text-base">Backup restoration complete!</div>
                    <div className="w-full bg-blue-900 rounded-full h-2 mt-2 overflow-hidden">
                      <div className="bg-green-400 h-2 rounded-full w-full"></div>
                    </div>
                    <button
                      onClick={handleManualRestart}
                      className="mt-4 px-4 md:px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors duration-200 border-2 border-green-400 text-sm md:text-base"
                    >
                      Re-enter Terminal
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating joke text at bottom */}
        <div className="fixed bottom-2 left-2 md:bottom-4 md:left-8 text-xs text-gray-300 space-y-1 max-w-[calc(100vw-1rem)] md:max-w-none">
          <div className="text-green-400">Press Ctrl+Alt+Del to restart (just kidding)</div>
          <div className="text-cyan-400">Or try turning it off and on again...</div>
        </div>
      </div>
    )
  }

  // === MAIN TERMINAL RENDER ===
  return (
    <section className="flex flex-col justify-start items-center relative overflow-hidden py-8">
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Terminal window */}
          <div className="bg-card border border-border rounded-lg shadow-2xl mb-8 flex flex-col">
            {/* Terminal header with traffic light buttons */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20 flex-shrink-0">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="ml-4 text-xs text-muted-foreground font-mono">terminal://root.anatole.co</span>
            </div>

            {/* Terminal content */}
            <div className="p-8 font-mono">
              <div className="text-left space-y-1">
                {/* Render all terminal lines */}
                {terminalLines.map((line, index) => {
                  return (
                    <p
                      key={index}
                      className={
                        line && line.includes("whitespace-pre")
                          ? ""
                          : (line && line.includes("INTRUSION_DETECTED")) ||
                              (line && line.includes("TARGET_ACQUIRED")) ||
                              (line && line.includes("[ALERT]")) ||
                              (line && line.includes("KILLSWITCH")) ||
                              (line && line.includes("WARNING:")) ||
                              (line && line.includes("CRITICAL ERROR")) ||
                              (line && line.includes("SYSTEM FAILURE")) ||
                              (line && line.includes("COMPROMISED"))
                            ? "text-red-400 font-bold"
                            : line && line.startsWith("$")
                              ? "text-green-400"
                              : line && line.startsWith("root@anatole")
                                ? "text-green-400 font-bold"
                                : line &&
                                    (line.includes("[ACCESS DENIED]") ||
                                      line.includes("Warning:") ||
                                      line.includes("Vulnerabilities") ||
                                      line.includes("Segmentation fault") ||
                                      line.includes("Stack overflow"))
                                  ? "text-red-400 font-bold"
                                  : line &&
                                      (line.includes("user_agent=") ||
                                        line.includes("platform=") ||
                                        line.includes("screen_res=") ||
                                        line.includes("color_depth=") ||
                                        line.includes("timezone=") ||
                                        line.includes("network_trace:") ||
                                        line.includes("fingerprint:") ||
                                        line.includes("$κιηηεя") ||
                                        line.includes("promprot@pm.me") ||
                                        line.includes("@CreativeSkyAI") ||
                                        line.includes("github.com/CreativeSkyAI"))
                                    ? "text-green-400"
                                    : line &&
                                        (line.includes("ANALYSIS_COMPLETE") ||
                                          line.includes("LOGGING_SESSION") ||
                                          line.includes("[INFO]") ||
                                          line.includes("Progress:") ||
                                          line.includes("successful") ||
                                          line.includes("complete") ||
                                          line.includes("granted") ||
                                          line.includes("100%") ||
                                          line.includes("Deleting"))
                                      ? "text-yellow-400"
                                      : "text-muted-foreground"
                      }
                      dangerouslySetInnerHTML={{ __html: line }}
                    />
                  )
                })}

                {/* Interactive input line */}
                {isInteractive && !isExitSequenceActive && (
                  <div className="flex items-center mt-2">
                    <span className="text-green-400 font-bold">root@anatole:~$</span>

                    <div className="relative flex-1 ml-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleInputSubmit}
                        className="bg-transparent border-none outline-none text-muted-foreground font-mono w-full"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Type 'help' for commands..."
                      />
                      {/* Animated cursor */}
                      <span
                        className={`absolute left-0 top-0 ${showInputCursor ? "opacity-100 text-green-400 font-bold text-lg" : "opacity-0"} transition-opacity duration-100 pointer-events-none`}
                        style={{ left: userInput.length > 0 ? `${userInput.length * 0.6}em` : "0" }}
                      >
                        _
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
