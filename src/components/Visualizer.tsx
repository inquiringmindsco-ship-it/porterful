'use client'

import { useState } from 'react'

export function Visualizer() {
  return null
}

export function useVisualizer() {
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false)

  const openVisualizer = () => setIsVisualizerOpen(true)
  const closeVisualizer = () => setIsVisualizerOpen(false)
  const toggleVisualizer = () => setIsVisualizerOpen((prev) => !prev)

  return { isVisualizerOpen, openVisualizer, closeVisualizer, toggleVisualizer }
}
