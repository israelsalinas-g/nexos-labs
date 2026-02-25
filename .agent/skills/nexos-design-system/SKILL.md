---
name: nexos-design-system
description: Single source of truth for NEXOS Residencial visual identity. Contains semantic design tokens, UX principles, and translation guides for Web (Tailwind/CSS) and Mobile (NativeWind/React Native). Use when implementing UI components, modifying themes, or ensuring consistency between platforms.
---

# NEXOS Design System

## Purpose
This skill centralizes the visual and interaction logic of the NEXOS Residencial ecosystem. It ensures that any UI modification (Web or Mobile) follows the "NEXOS Premium" standard, maintaining accessibility, legibility, and architectural integrity.

## Core Semantic Tokens

### 1. Surface & Depth
Used for containers, backgrounds, and cards.

| Token | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `--surface-primary` | `#ffffff` | `#0f172a` (Slate 900) | Main background |
| `--surface-secondary` | `#f8fafc` | `#1e293b` (Slate 800) | Secondary backgrounds, subtle depth |
| `--surface-tertiary` | `#f1f5f9` | `#334155` (Slate 700) | Muted surfaces, input contrast |

### 2. Typography (The "Readability" Standard)
Mandatory classes for text to ensure automatic Light/Dark adaptability.

| Token | Light Value | Dark Value | Usage |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#1e293b` | `#ffffff` | Titles, main content |
| `--text-secondary` | `#64748b` | `#94a3b8` | Subtitles, labels, secondary info |
| `--text-tertiary` | `#94a3b8` | `#64748b` | Metadata, placeholder-level info |

### 3. Status & Feedback
Semantic colors for badges and alerts.

| Status | Background (Dark Context) | Text (Dark Context) | Meaning |
| :--- | :--- | :--- | :--- |
| **Success** | `rgba(22, 163, 74, 0.1)` | `#4ade80` | Confirmed, active, resolved |
| **Warning** | `rgba(217, 119, 6, 0.1)` | `#fbbf24` | Pending, attention required |
| **Danger** | `rgba(220, 38, 38, 0.1)` | `#f87171` | Expired, error, rejected |
| **Info** | `rgba(37, 99, 235, 0.1)` | `#60a5fa` | Processing, neutral details |

## Implementation Reference

### Web (Tailwind + design_tokens.css)
*   **File**: `app/static/design_tokens.css`
*   **Usage**: Favor `.ui-*` utility classes over raw Tailwind classes for semantic elements.
*   **Example**: `<h2 class="ui-title">` instead of `<h2 class="text-2xl font-bold text-slate-900">`.

### Mobile (NativeWind + Colors.ts)
*   **Translation Mapping**:
    *   Web `--surface-primary` → Mobile `surfacePrimary` (NativeWind class)
    *   Web `--text-primary` → Mobile `textPrimary`
    *   Web CSS Variables → `tailwind.config.js` extensions.

## UX Principles
1.  **Touch Targets**: Minimum 44x44 points for any interactive element.
2.  **Readability**: No hardcoded slate-600/700 on text. Use semantic tokens to prevent dark-on-dark issues.
3.  **Consistency**: Modals, Badges, and Headers must maintain the same hierarchical weight on both platforms.

---
**Skill Status**: ACTIVE
**Source**: `app/static/design_tokens.css`
