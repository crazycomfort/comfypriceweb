# Global Visual Hierarchy System

## Overview
A comprehensive visual hierarchy system that enforces consistent spacing, typography, and action emphasis across all views (homeowner, contractor, technician).

## Hierarchy Levels

### PRIMARY SECTIONS
**Purpose**: Hero-level content, maximum visual impact
**Usage**: Landing pages, main page headers, key value propositions

**Spacing**: `py-16 md:py-24 lg:py-32` (64px-128px)
**Typography**: 
- Title: `text-4xl md:text-5xl lg:text-6xl font-bold`
- Subtitle: `text-xl md:text-2xl`

**Components**:
- `<PrimarySection>` - Container with consistent spacing
- `<PrimaryHeader>` - Title and subtitle with proper hierarchy

### SECONDARY SECTIONS
**Purpose**: Education, informational content, main page content
**Usage**: Form pages, informational sections, main content areas

**Spacing**: `py-12 md:py-16 lg:py-20` (48px-80px)
**Typography**:
- Title: `text-3xl md:text-4xl font-bold`
- Subtitle: `text-lg md:text-xl`

**Components**:
- `<SecondarySection>` - Container with consistent spacing
- `<SecondaryHeader>` - Title and subtitle with proper hierarchy

### TERTIARY SECTIONS
**Purpose**: Supporting details, less prominent information
**Usage**: Helper text, footnotes, supplementary information

**Spacing**: `py-8 md:py-12` (32px-48px)
**Typography**:
- Title: `text-2xl md:text-3xl font-semibold`
- Subtitle: `text-base md:text-lg`

**Components**:
- `<TertiarySection>` - Container with consistent spacing
- `<TertiaryHeader>` - Title and subtitle with proper hierarchy

## CTA Hierarchy

### PRIMARY CTA
**Rule**: Only ONE per view
**Visual Weight**: Maximum emphasis
**Styling**: 
- Large size (`px-8 py-4`)
- Primary color (`bg-primary-600`)
- Strong shadow (`shadow-xl`)
- Hover effects (lift, shadow increase)

**Component**: `<PrimaryCTA>`

### SECONDARY ACTIONS
**Rule**: Visually de-emphasized
**Visual Weight**: Moderate
**Styling**:
- Medium size (`px-6 py-3`)
- White background with border
- Subtle shadow (`shadow-sm`)
- Less prominent hover effects

**Component**: `<SecondaryCTA>`

### TERTIARY ACTIONS
**Rule**: Minimal emphasis
**Visual Weight**: Subtle
**Styling**:
- Small size (`px-4 py-2`)
- Text-only or minimal background
- No shadow
- Subtle hover state

**Component**: `<TertiaryCTA>`

## Spacing Scale

Consistent spacing scale applied globally:

```
--space-xs: 0.5rem;      /* 8px */
--space-sm: 0.75rem;     /* 12px */
--space-md: 1rem;        /* 16px */
--space-lg: 1.5rem;      /* 24px */
--space-xl: 2rem;        /* 32px */
--space-2xl: 3rem;       /* 48px */
--space-3xl: 4rem;       /* 64px */
--space-4xl: 6rem;       /* 96px */
--space-5xl: 8rem;       /* 128px */
```

## Card Hierarchy

### PRIMARY CARDS
- `card-primary`: Maximum emphasis, larger padding, stronger shadow
- Used for: Key information, main content blocks

### SECONDARY CARDS
- `card-secondary`: Standard emphasis, medium padding, moderate shadow
- Used for: Supporting content, lists, grids

### TERTIARY CARDS
- `card-tertiary`: Subtle emphasis, smaller padding, minimal shadow
- Used for: Helper information, less important content

## Usage Examples

### Homeowner Flow
```tsx
<SecondarySection>
  <SecondaryHeader 
    title="Step 1: Location"
    subtitle="HVAC pricing varies significantly by region..."
    align="center"
  />
  
  {/* Form content */}
  
  <div className="flex justify-between">
    <SecondaryCTA href="/">Back</SecondaryCTA>
    <PrimaryCTA onClick={handleNext}>Continue</PrimaryCTA>
  </div>
</SecondarySection>
```

### Contractor Dashboard
```tsx
<SecondarySection background="subtle">
  <SecondaryHeader 
    title="Your Estimate Experience"
    subtitle="Configure your homeowner-facing estimate flow..."
    align="center"
  />
  
  <Card level="primary">
    {/* Key information */}
  </Card>
  
  <div className="grid md:grid-cols-3 gap-6">
    <Card level="secondary">
      {/* Configuration option */}
    </Card>
  </div>
</SecondarySection>
```

## Rules Enforcement

1. **Only One Primary CTA Per View**
   - Use `<PrimaryCTA>` for the main action
   - All other actions must use `<SecondaryCTA>` or `<TertiaryCTA>`

2. **Consistent Spacing**
   - Use section components (`PrimarySection`, `SecondarySection`, `TertiarySection`)
   - They enforce consistent spacing automatically

3. **Visual De-emphasis**
   - Secondary actions are automatically styled with less visual weight
   - Tertiary actions are minimal and subtle

4. **Typography Hierarchy**
   - Use header components (`PrimaryHeader`, `SecondaryHeader`, `TertiaryHeader`)
   - They enforce proper font sizes and spacing

## Implementation Status

✅ Global CSS variables defined
✅ Component library created (`SectionHierarchy.tsx`)
✅ Landing page updated
✅ Homeowner h1 updated
✅ Homeowner h2 updated
✅ Contractor dashboard structure updated
⏳ Remaining pages to be updated

## Next Steps

1. Apply to remaining homeowner pages (h3, h4, h5, h6, h7-h13)
2. Apply to remaining contractor pages
3. Apply to technician pages
4. Audit all pages for single primary CTA rule
5. Ensure all secondary actions are de-emphasized



