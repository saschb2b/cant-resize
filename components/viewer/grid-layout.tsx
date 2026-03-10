'use client'

import { useViewer } from './viewer-provider'
import { ViewportFrame } from './viewport-frame'

export function GridLayout() {
  const { state } = useViewer()

  return (
    <div className="flex-1 overflow-auto p-6 bg-muted/30">
      <div className="flex flex-wrap gap-6 justify-center items-start">
        {state.viewports.map((viewport) => (
          <ViewportFrame key={viewport.id} viewport={viewport} isGridMode />
        ))}
        {state.viewports.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p className="text-lg font-medium">No devices added</p>
            <p className="text-sm">Click &quot;Add Device&quot; to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
