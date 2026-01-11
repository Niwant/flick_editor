# Setup Instructions

## Install Dependencies

```bash
npm install
# or
pnpm install
# or  
yarn install
```

## Note on Twick Packages

The Twick packages (`@twick/*`) are specified with version `^0.1.0`. If these versions are not available:

1. Check the latest versions at: https://www.npmjs.com/org/twick
2. Update `package.json` with the correct versions
3. Alternatively, you may need to install Twick from the GitHub repository:
   ```bash
   npm install github:ncounterspecialist/twick#main
   ```

## Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Troubleshooting

### Twick Packages Not Found
If you encounter issues installing Twick packages, you may need to:
1. Clone the Twick repository locally
2. Build the packages
3. Link them using `npm link` or `pnpm link`

### ReactFlow Styles Not Loading
If the node graph appears unstyled, ensure `reactflow/dist/style.css` is imported. It's currently imported in `src/components/NodeGraph/NodeGraph.tsx`.

### Fabric.js Canvas Issues
Ensure Fabric.js v5.x is installed. If you see canvas-related errors, check browser console for Fabric.js version compatibility.

## Project Structure

```
flick-studio/
├── src/
│   ├── components/      # React components
│   │   ├── Canvas/      # Video canvas editor
│   │   ├── Timeline/    # Timeline component
│   │   ├── NodeGraph/   # Node graph editor
│   │   ├── Playback/    # Video playback
│   │   └── Toolbar/     # Editor toolbar
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── package.json
└── vite.config.ts
```

## Key Features Implemented

✅ Canvas editor with Fabric.js  
✅ Multi-track timeline with drag-and-drop  
✅ Node graph editor with React Flow  
✅ Video playback with Twick LivePlayer  
✅ State management with Zustand  
✅ Full TypeScript support  
✅ Modern UI with Tailwind CSS  
✅ Keyboard shortcuts  
✅ Professional UX patterns  
