# Flick Studio - AI Native Video Editor

A professional video editing application built with React, TypeScript, and Twick. Designed to showcase modern frontend engineering capabilities for video editing interfaces.

## Features

### 🎬 Core Video Editing
- **Canvas Editor**: Visual canvas for positioning and transforming video elements using Fabric.js
- **Timeline Editor**: Multi-track timeline with drag-and-drop clip management
- **Node Graph**: Visual node-based effect composition system using React Flow
- **Playback Controls**: Real-time video preview with Twick LivePlayer integration

### 🎨 User Interface
- **Modern UI**: Clean, Figma-inspired interface with Tailwind CSS
- **Multiple View Modes**: Canvas view, playback view, and split view
- **Professional Toolbar**: Media import, editing tools, and effects panel
- **Keyboard Shortcuts**: Power user workflow with ⌘+key combinations

### ⚡ Technical Highlights
- **State Management**: Zustand for scalable state management
- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized rendering with React memoization
- **Modular Architecture**: Clean separation of concerns with component-based design

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:3000`

## Architecture

```
src/
├── components/
│   ├── Canvas/          # Fabric.js canvas editor
│   ├── Timeline/        # Timeline track management
│   ├── NodeGraph/       # React Flow node editor
│   ├── Playback/        # Twick LivePlayer integration
│   └── Toolbar/         # Editor toolbar and controls
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Key Technologies

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Twick**: Video editing toolkit (`@twick/studio`, `@twick/timeline`, `@twick/live-player`)
- **Fabric.js**: Canvas manipulation library
- **React Flow**: Node graph editor
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool and dev server

## Usage

### Adding Media
1. Click "Import Media" in the toolbar
2. Select video, audio, or image files
3. Clips are automatically added to the timeline

### Editing Clips
- **Select**: Click on a clip in the timeline
- **Move**: Drag clips horizontally to change timing
- **Split**: Select a clip and press `S` or use the Split tool
- **Delete**: Select a clip and press `Delete` or use the Delete tool

### Canvas Editing
- **Pan**: Hold `Alt` and drag to pan the canvas
- **Zoom**: Use zoom controls in the top-right corner
- **Transform**: Select elements and use handles to resize/rotate

### Keyboard Shortcuts
- `Space`: Play/Pause
- `⌘+1`: Canvas view
- `⌘+2`: Playback view
- `⌘+3`: Split view
- `⌘+←/→`: Frame-by-frame scrubbing
- `S`: Split clip at playhead
- `Delete`: Delete selected clip

## Project Structure

This project demonstrates:
- **Complex State Management**: Managing timeline, canvas, and node graph state
- **Performance Optimization**: Memoization, efficient re-renders, optimized canvas updates
- **User Experience**: Intuitive controls, responsive design, professional UI/UX
- **Code Quality**: TypeScript, modular architecture, clean code practices
- **Integration**: Seamless integration with Twick video editing toolkit

## Development Notes

- Built for the Flick Frontend Founder role application
- Showcases ability to build complex, high-performance editing interfaces
- Demonstrates understanding of video editing workflows and UX patterns
- Production-ready architecture with scalability in mind

## License

This project is created for portfolio/application purposes.
