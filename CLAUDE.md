# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Campaign Builder / Ad Manager application built with React and Vite. It allows users to create and manage advertising campaigns, build ad creatives, and customize them with various targeting options.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run development server with backend API
npm run dev:full

# Start backend server only
npm run server

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Frontend
- React application built with Vite
- Tailwind CSS for styling
- LocalStorage for data persistence
- Dark mode support with both system preference detection and manual toggle

### Backend
- Express.js server (server.cjs)
- Product image scraping API with caching
- CORS configuration for API access

## Main Application Flow

The application follows a multi-step workflow:

1. **Campaign Creation** (`VIEW_CREATE_CAMPAIGN`) - Set up audience targeting
2. **Asset Selection** (`VIEW_START`, `VIEW_UPLOAD`, `VIEW_URL`) - Add product images/assets
3. **Creative Review** (`VIEW_CUSTOMIZE`, `VIEW_PUBLISH`) - Customize and finalize ad

## Key Features

### Product Image Fetching
- Backend API endpoint (`/api/fetch-product-image`) scrapes product pages for images
- Fallback mechanisms for different image types (Open Graph, Twitter Card, etc.)
- In-memory caching system for performance

### Ad Customization
- Multiple ad size formats (300x250, 320x50, 320x400)
- Audience targeting options (demographic, diet types)
- Geographic and retailer targeting
- Call-to-action customization

### Dark Mode
- Automatic detection based on system preferences
- Manual toggle option
- Tailwind CSS integration using the class strategy

## File Structure Highlights

- `/src/App.jsx` - Main application component with views and state management
- `/server.cjs` - Express server for product image fetching API
- `/api/fetch-product-image.js` - Serverless function for product image fetching
- `/vercel.json` - Deployment configuration for Vercel