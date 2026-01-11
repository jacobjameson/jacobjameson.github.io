# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal academic website built with [Quarto](https://quarto.org/) and hosted via GitHub Pages at https://jacobjameson.com. The site showcases research, teaching materials, and blog posts for a PhD candidate at Harvard University.

## Build and Development

### Building the Site

```bash
quarto render
```

This generates static HTML output to the `docs/` directory, which is served by GitHub Pages.

### Preview During Development

```bash
quarto preview
```

Opens a local development server with live reload.

### Render Specific Files

```bash
quarto render index.qmd
quarto render research.qmd
```

## Site Architecture

### Configuration

- **`_quarto.yml`**: Main site configuration
  - Defines website structure, navigation, and metadata
  - Sets output directory to `docs/` for GitHub Pages
  - Configures theme (`flatly` with custom `theme-light.scss`)
  - Includes Google Analytics tracking
  - Defines navbar with social links and dropdown menus

### Content Structure

- **`index.qmd`**: Homepage with animated typing effect, about section, and news feed
- **`research.qmd`**: Research page with custom CSS for styling papers and projects
- **`teaching.qmd`**: Teaching experience and awards with custom card layouts
- **`posts/`**: Blog posts organized by date (format: `YYYY-MM-DD-TOPIC/`)
- **`R files/`**: Introduction to R course materials organized in numbered modules (0-9) with modern landing page
- **`git files/`**: Introduction to Git/GitHub tutorial sections (1-6) with modern landing page
- **`api 222 files/`**: API 222 course section materials (sections 1-10) with modern landing page
- **`Data/`**: Contains CV, data visualizations, and Tidy Tuesday projects

### Styling

- **`theme-light.scss`**: Custom SCSS theme extending Flatly
  - Uses Google Fonts: Handjet (retro style) and Montserrat (base)
  - Custom styling for research and teaching pages
  - Inline CSS in individual `.qmd` files for page-specific styles

### Output

- **`docs/`**: Rendered HTML output served by GitHub Pages
  - Contains all compiled HTML, assets, and site libraries
  - Includes `CNAME` file for custom domain

## File Naming Conventions

- Course materials use spaces in directory names (e.g., `R files`, `api 222 files`)
- Quote paths with spaces when using bash commands
- Blog posts follow date-based naming: `YYYY-MM-DD-TOPIC/`

## Key Features

- **Dynamic Typing Effect**: JavaScript animation on homepage cycling through roles
- **Quarto Markdown**: All content written in `.qmd` (Quarto Markdown) format
- **Custom CSS Sections**: Research and teaching pages have extensive inline CSS for card layouts and hero sections
- **Social Integration**: Open Graph and Twitter Card metadata configured for social sharing
- **Responsive Navigation**: Collapsible navbar with dropdown menus for teaching materials

## GitHub Pages Deployment

The site is automatically deployed from the `docs/` directory on the `main` branch. After rendering, commit and push changes to trigger deployment.

## Content Organization Pattern

Teaching materials are organized hierarchically:
- Top-level navigation items link to index pages (e.g., `API222.qmd`, `Intro R.qmd`, `Intro Git.qmd`)
- Each index page features a modern card-based design with:
  - Clean header with course description
  - Module/section cards with numbered badges (no emojis)
  - Purple gradient styling (#8b5cf6 to #6366f1)
  - Hover effects and smooth animations
  - "About" or info section at the bottom
- Individual lessons/sections are in numbered subdirectories
- Each section contains a `.qmd` file and associated data/materials
- All teaching materials are designed for self-paced learning
