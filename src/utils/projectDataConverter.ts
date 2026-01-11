import { Track } from '../types/editor'

/**
 * Converts tracks/clips format (used by editorStore) to projectData format (used by LivePlayer)
 * 
 * Editor format: { tracks: [{ clips: [...] }] }
 * LivePlayer format: { input: { tracks: [{ elements: [...] }], properties: {...}, version: 1 } }
 */
export function convertTracksToProjectData(
  tracks: Track[],
  resolution: { width: number; height: number } = { width: 1920, height: 1080 }
) {
  const convertedTracks = tracks.map((track) => {
    // Convert clips to elements
    const elements = track.clips.map((clip) => {
      const clipProps = clip.properties || {}
      const {
        animation,
        textEffect,
        frameEffects,
        objectFit,
        ...restProps
      } = clipProps
      const element: any = {
        id: clip.id,
        trackId: track.id,
        type: clip.type,
        s: clip.startTime, // start time
        e: clip.startTime + clip.duration, // end time
        props: {},
      }
      if (animation) {
        element.animation = animation
      }
      if (textEffect) {
        element.textEffect = textEffect
      }
      if (frameEffects) {
        element.frameEffects = frameEffects
      }
      if (objectFit) {
        element.objectFit = objectFit
      }

      // Convert clip properties based on type
      switch (clip.type) {
        case 'video':
          element.props.src = clip.videoUrl || ''
          element.props.play = true
          if (clip.trimStart > 0 || clip.trimEnd > 0) {
            element.props.time = clip.trimStart
          }
          break

        case 'audio':
          element.props.src = clip.audioUrl || ''
          element.props.play = true
          element.props.volume = clip.properties?.volume || 0.5
          if (clip.trimStart > 0 || clip.trimEnd > 0) {
            element.props.time = clip.trimStart
          }
          break

        case 'image':
          element.props.src = clip.imageUrl || ''
          break

        case 'text':
          element.props.text = clip.text || 'Sample Text'
          element.props.fontSize = clip.properties?.fontSize || 48
          element.props.fill = clip.properties?.color || '#ffffff'
          element.props.fontFamily = clip.properties?.fontFamily || 'Arial'
          if (clip.properties?.x !== undefined) {
            element.props.x = clip.properties.x
          }
          if (clip.properties?.y !== undefined) {
            element.props.y = clip.properties.y
          }
          if (clip.properties?.alignment) {
            element.props.textAlign = clip.properties.alignment
          }
          if (clip.properties?.maxWidth) {
            element.props.maxWidth = clip.properties.maxWidth
          }
          if (clip.properties?.textWrap) {
            element.props.textWrap = clip.properties.textWrap
          }
          break

        case 'effect':
          // Effects are passed through as-is
          if (clip.properties) {
            Object.assign(element.props, clip.properties)
          }
          break
      }

      // Merge any additional properties
      if (Object.keys(restProps).length > 0) {
        Object.assign(element.props, restProps)
      }

      return element
    })

    // Determine track type for LivePlayer
    // LivePlayer uses "element" for visual tracks, "audio" for audio tracks
    const trackType = track.type === 'audio' ? 'audio' : 'element'

    return {
      id: track.id,
      type: trackType,
      name: track.name,
      elements,
    }
  })

  return {
    input: {
      properties: {
        width: resolution.width,
        height: resolution.height,
      },
      context: {
        requestId: `flick-studio-${Date.now()}`,
      },
      tracks: convertedTracks,
      version: 1,
    },
  }
}
