# Promethean Protocols Terminal Design System Template

A cyberpunk-inspired design system featuring a dual-theme approach with clean professional aesthetics in light mode and matrix-style hacker terminal aesthetics in dark mode.

## Color Palette

### Brand Colors
- **Primary**: `#059669` (Emerald Green) - Main brand color, consistent across themes
- **Secondary**: `#10b981` (Light Emerald) - Secondary actions and accents
- **Matrix Green**: `#00ff41` - Signature terminal green for dark mode text
- **Accent**: `#10b981` - Interactive elements and highlights

### Light Mode (Professional)
- **Background**: `#ffffff` (Pure White)
- **Foreground**: `#000000` (Black Text)
- **Card**: `#f8f9fa` (Light Gray)
- **Muted**: `#e5e7eb` (Light Gray Backgrounds)
- **Border**: `#e5e7eb` (Subtle Borders)

### Dark Mode (Cyberpunk Terminal)
- **Background**: `#0a0a0a` (Deep Black)
- **Foreground**: `#00ff41` (Matrix Green)
- **Card**: `#111111` (Dark Gray)
- **Muted**: `#333333` (Medium Gray)
- **Border**: `#333333` (Dark Borders)

### Status Colors
- **Destructive**: `#dc2626` (Red)
- **Success**: `#059669` (Emerald - using primary)
- **Warning**: `#f59e0b` (Orange)
- **Info**: `#0891b2` (Cyan)

### Chart Colors
1. `#059669` (Primary Emerald)
2. `#10b981` (Secondary Emerald)
3. `#00ff41` (Matrix Green)
4. `#0891b2` (Cyan Complement)
5. `#f59e0b` (Orange Contrast)

## Typography

### Font Families
- **Sans**: DM Sans - Clean, professional body text
- **Mono**: Geist Mono - Terminal/code aesthetic

### Font Usage
- **Body Text**: DM Sans for readability
- **Terminal Elements**: Geist Mono for authentic hacker feel
- **Code Blocks**: Geist Mono for syntax highlighting

## Layout & Spacing

### Border Radius Scale
- **Sharp**: `0px` - Very sharp, technical feel
- **Subtle**: `2px` - Slightly rounded
- **Default**: `4px` - Standard rounded corners
- **Soft**: `8px` - More rounded for friendly elements

### Design Principles
- **Contrast**: High contrast in both themes for accessibility
- **Consistency**: Brand colors remain consistent across light/dark modes
- **Hierarchy**: Clear visual hierarchy using color and typography
- **Accessibility**: WCAG compliant color combinations

## Theme Implementation

### CSS Custom Properties
Uses CSS custom properties for seamless theme switching:
\`\`\`css
:root { /* Light mode tokens */ }
.dark { /* Dark mode overrides */ }
\`\`\`

### Tailwind Integration
- Tailwind CSS v4 with custom theme configuration
- CSS variables mapped to Tailwind color tokens
- Custom dark mode variant: `@custom-variant dark`

## Special Features

### Animations
- **Blink**: Terminal cursor animation (`1s step-end infinite`)
- **Smooth Transitions**: Theme switching with CSS transitions

### Accessibility
- High contrast ratios in both themes
- Semantic color naming
- Screen reader friendly implementations

## Usage Guidelines

### When to Use Light Mode
- Professional presentations
- Documentation
- Business-focused content
- Daytime usage

### When to Use Dark Mode
- Terminal/coding interfaces
- Gaming or tech-focused content
- Low-light environments
- Cyberpunk aesthetic emphasis

### Color Application
- Use primary emerald for main actions
- Matrix green only in dark mode for text
- Maintain brand consistency across themes
- Ensure sufficient contrast for accessibility

This design system balances professional usability with a distinctive cyberpunk identity, making it perfect for developer tools, security applications, or any product targeting technical audiences.
