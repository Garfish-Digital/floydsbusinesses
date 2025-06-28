# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-business portfolio website for Floyd, showcasing two distinct businesses:
- **The House Surgeon**: Professional plumbing services in Indianapolis
- **Crentoon Studios**: Videography and creative video production services

The site is structured as a static website with a main landing page and two business-specific subdirectories, each with their own complete website.

## Architecture

### Site Structure
```
/                           # Main landing page (Floyd's portfolio)
├── index.html             # Main landing page with business cards
├── scripts/main.js        # Main page interactions
├── styles/style.css       # Main page styling
├── images/                # Shared images and logos
├── crentoon_studios/      # Videography business site
│   ├── index.html         # Complete videography portfolio
│   ├── scripts/           # Video playback and interactions
│   └── assets/            # Videos, images, posters
└── the_house_surgeon/     # Plumbing business site
    ├── index.html         # Complete plumbing services site  
    ├── scripts/           # Interactive elements
    └── assets/            # Work photos and videos
```

### Technology Stack
- **Framework**: Vanilla HTML/CSS/JavaScript (no build process)
- **CSS Framework**: Tailwind CSS (via CDN)
- **Fonts**: Inter (Google Fonts)
- **Deployment**: Netlify with form handling
- **Video**: HTML5 video elements with custom controls

## Development

### No Build Process
This is a static site with no package.json or build steps. All dependencies are loaded via CDN:
- Tailwind CSS: `https://cdn.tailwindcss.com`
- Inter font: Google Fonts CDN

### Testing Changes
Since there's no build process, simply:
1. Open `index.html` in a browser for the main site
2. Navigate to subdirectories to test business-specific pages
3. Test form submissions on staging/production environment

### Video Assets
Each business subdirectory contains:
- `clips/`: MP4 video files for portfolios and hero sections
- `images/`: Poster images for video preload and project photos
- Custom video controls via `clips.js` for play/pause functionality

## Key Features

### Navigation
- Main landing page has animated business cards linking to subdirectories
- Each business site has a home button returning to main landing
- Smooth transitions and hover effects throughout

### Forms
- Netlify form handling with honeypot spam protection
- Business-specific contact forms with different field sets
- Form names: `crentoon_studios` and `the-house-surgeon`

### Interactive Elements
- Custom video players with poster images
- Image slideshows and flip cards for portfolios
- Smooth reveal animations on scroll
- Custom cursor effects (desktop only)

## File Patterns

### Contact Information
- Main contact: `crentoonnetworthllc@gmail.com` | `(217) 918-1273`
- Emergency plumbing: `(217) 304-4676`

### Styling Conventions
- Color schemes: Green gradients for plumbing, red/orange for videography
- Consistent dark theme: `bg-[#1a1a1a]`, `bg-[#121212]`, `bg-[#1e1e1e]`
- Tailwind utility classes throughout
- Custom CSS in separate `style.css` files for complex animations

### Image Naming
- Favicons: `{business}-favicon.PNG`
- Logos: `{business}-logo.PNG`
- Posters: `{project}-poster.png`
- Project images: `projects-{type}.jpg`