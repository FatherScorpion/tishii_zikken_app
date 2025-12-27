import { useState, useEffect } from 'react'
import './CustomCursor.css'

function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const hideCursor = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', updateCursor)
    window.addEventListener('mouseenter', updateCursor)
    window.addEventListener('mouseleave', hideCursor)

    return () => {
      window.removeEventListener('mousemove', updateCursor)
      window.removeEventListener('mouseenter', updateCursor)
      window.removeEventListener('mouseleave', hideCursor)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="custom-cursor"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="cursor-dot" />
    </div>
  )
}

export default CustomCursor

