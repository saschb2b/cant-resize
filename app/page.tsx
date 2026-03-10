'use client'

import { ViewerProvider } from '@/components/viewer/viewer-provider'
import { Toolbar } from '@/components/viewer/toolbar'
import { Canvas } from '@/components/viewer/canvas'

export default function ResponsiveViewerPage() {
  return (
    <ViewerProvider>
      <div className="flex flex-col h-screen bg-background">
        <Toolbar />
        <Canvas />
      </div>
    </ViewerProvider>
  )
}
