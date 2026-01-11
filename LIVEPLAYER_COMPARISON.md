# LivePlayer Comparison: Examples vs Main App

## Overview

This document compares how `LivePlayer` is used in the examples folder vs the main application to help identify and resolve live-player issues.

## Key Differences

### 1. Component Usage

**Examples Folder (✅ Correct):**
```tsx
import { LivePlayer } from "@twick/live-player";

<LivePlayer
  projectData={playerData}
  onDurationChange={(duration: number) => {
    videoDurationRef.current = duration;
    setVideoDuration(duration);
  }}
  videoSize={{
    width: 720,
    height: 1280,
  }}
  onTimeUpdate={handleTimeUpdate}
  playing={playing}
/>
```

**Main App (❌ Not Using LivePlayer):**
```tsx
// Uses LivePlayerProvider but NOT LivePlayer component
<LivePlayerProvider>
  <TimelineProvider>
    {/* Uses native HTML5 <video> element instead */}
    <VideoPlayback />
  </TimelineProvider>
</LivePlayerProvider>
```

### 2. Data Structure

**Examples Format (projectData):**
```typescript
{
  input: {
    properties: {
      width: 720,
      height: 1280
    },
    context: {
      requestId: "..."
    },
    tracks: [
      {
        id: "t-track-1",
        type: "element",
        elements: [  // ← Uses "elements" array
          {
            id: "e-244f8d5a3baa",
            trackId: "t-track-1",
            type: "rect",
            s: 0,        // ← Start time (s = start)
            e: 5,        // ← End time (e = end)
            props: {
              width: 720,
              height: 1280,
              fill: "#FFF000"
            }
          }
        ],
        name: "element"
      },
      {
        id: "t-track-2",
        type: "element",
        elements: [
          {
            id: "e-244f8d5a3bba",
            trackId: "t-track-2",
            type: "text",
            s: 0,
            e: 1,
            props: {
              text: "Hello Guys!",
              fontSize: 100,
              fill: "#FF0000"
            }
          }
        ]
      },
      {
        id: "t-track-3",
        type: "audio",
        elements: [
          {
            id: "e-244f8d5aabaa",
            trackId: "t-track-3",
            type: "audio",
            s: 0,
            e: 5,
            props: {
              src: "https://...",
              play: true,
              volume: 0.5
            }
          }
        ]
      }
    ],
    version: 1
  }
}
```

**Main App Format (current tracks/clips):**
```typescript
{
  tracks: [
    {
      id: "track-video-1",
      name: "Video Track 1",
      type: "video",
      clips: [  // ← Uses "clips" array
        {
          id: "clip-123",
          name: "Video Clip",
          type: "video",
          startTime: 0,      // ← Different property names
          duration: 10,      // ← Uses duration instead of end time
          trimStart: 0,
          trimEnd: 0,
          videoUrl: "https://...",
          effects: [],
          properties: {}
        }
      ],
      height: 80,
      muted: false,
      locked: false,
      solo: false
    }
  ]
}
```

### 3. Package Versions

**Examples:**
- `@twick/live-player`: `^0.15.0`
- `@twick/timeline`: `^0.15.0`
- `@twick/studio`: `^0.15.0`

**Main App:**
- `@twick/live-player`: `^0.14.7` (installed as 0.14.20)
- `@twick/timeline`: `^0.14.7`
- `@twick/studio`: `^0.14.7`

## Issues Identified

1. **Main app is NOT using LivePlayer component** - It has `LivePlayerProvider` but uses native HTML5 `<video>` instead
2. **Data structure mismatch** - Main app uses `clips` array, LivePlayer expects `elements` array
3. **Property name differences** - `startTime`/`duration` vs `s`/`e`, different structure for props
4. **Version mismatch** - Examples use v0.15.0, main app uses v0.14.7

## Next Steps

To fix the live-player integration:

1. **Option A: Migrate to LivePlayer component**
   - Create a converter function to transform tracks/clips format to projectData format
   - Replace native `<video>` in `VideoPlayback.tsx` with `LivePlayer` component
   - Update to match examples' usage pattern

2. **Option B: Keep native video but fix issues**
   - Identify what specific issues exist with current native video implementation
   - Fix those issues while keeping native video player

3. **Option C: Update package versions**
   - Update all Twick packages to v0.15.0 to match examples
   - Test if this resolves any compatibility issues

## Files to Review

- `/examples/src/pages/example-video.tsx` - Working LivePlayer usage
- `/examples/src/pages/example-studio.tsx` - Studio usage with LivePlayerProvider
- `/src/components/Playback/VideoPlayback.tsx` - Current native video implementation
- `/src/App.tsx` - LivePlayerProvider setup
- `/src/store/editorStore.ts` - Data structure definitions
