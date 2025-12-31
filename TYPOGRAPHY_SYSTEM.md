# Premium Typography System

## Overview
A calm, professional typography system designed for clarity and readability. Not startup-y.

## Font Families (2 max)
1. **Inter** (`font-sans`) - Primary font for body text, UI elements, and most content
2. **Playfair Display** (`font-display`) - Display font for hero headlines and major titles

## Typography Scale

### Display (Largest)
- **Class**: `.text-display`
- **Font**: Playfair Display
- **Size**: 48px → 60px → 72px (responsive)
- **Weight**: 500 (Medium)
- **Line Height**: 1.2
- **Use**: Hero headlines, page titles, major announcements

### Section (Section Headers)
- **Class**: `.text-section`
- **Font**: Inter
- **Size**: 30px → 36px → 40px (responsive)
- **Weight**: 600 (Semibold)
- **Line Height**: 1.3
- **Use**: Section headers, major headings

### Body (Main Content)
- **Class**: `.text-body`
- **Font**: Inter
- **Size**: 16px
- **Weight**: 400 (Regular)
- **Line Height**: 1.7
- **Use**: Paragraphs, general content

### Body Large
- **Class**: `.text-body-large`
- **Font**: Inter
- **Size**: 18px
- **Weight**: 400 (Regular)
- **Line Height**: 1.75
- **Use**: Important paragraphs, introductions

### Education (Education Copy)
- **Class**: `.text-education` or `.text-education-large`
- **Font**: Inter
- **Size**: 16px or 18px
- **Weight**: 400 (Regular)
- **Line Height**: 1.85-1.9 (Maximum readability)
- **Use**: Educational content, explanations, instructional text

### Meta (Small Text)
- **Class**: `.text-meta` or `.text-meta-small`
- **Font**: Inter
- **Size**: 14px or 12px
- **Weight**: 400 (Regular)
- **Line Height**: 1.5
- **Use**: Captions, labels, helper text, timestamps

## Font Weights
**Reduced variety** - Only three weights:
- **400** (Regular) - Default for body text
- **500** (Medium) - For emphasis, CTAs
- **600** (Semibold) - For headings

**Avoid**: Bold (700), Extra Bold (800), Black (900)

## Usage Examples

```tsx
// Hero headline
<h1 className="text-display">Your Pricing Authority Estimate</h1>

// Section header
<h2 className="text-section">Understanding Your Estimate</h2>

// Body text
<p className="text-body">This is regular paragraph text.</p>

// Education copy (generous line height)
<p className="text-education">
  The pricing ranges you see are based on typical HVAC installations...
</p>

// Meta text
<span className="text-meta">Last updated: January 2024</span>
```

## Section Hierarchy Classes

The visual hierarchy system automatically uses the typography scale:

- `.section-primary-title` → Uses `.text-display`
- `.section-primary-subtitle` → Uses `.text-body-large`
- `.section-secondary-title` → Uses `.text-section`
- `.section-secondary-subtitle` → Uses `.text-body-large`
- `.section-tertiary-title` → Custom section size
- `.section-tertiary-subtitle` → Uses `.text-body`

## Tone Guidelines
- **Calm**: Generous line heights, medium weights (not bold)
- **Professional**: Clean Inter, elegant Playfair Display
- **Not startup-y**: No heavy weights, no quirky fonts, no excessive tracking



