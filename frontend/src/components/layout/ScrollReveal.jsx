import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

/**
 * ScrollReveal — wraps any section in a smooth fade+slide-up animation
 * triggered when the element enters the viewport.
 *
 * Props:
 *  - children     : content to reveal
 *  - delay        : animation delay in seconds (default 0)
 *  - direction    : 'up' | 'down' | 'left' | 'right' (default 'up')
 *  - distance     : pixels to travel (default 50)
 *  - duration     : animation duration in seconds (default 0.7)
 *  - threshold    : IntersectionObserver threshold (default 0.1)
 *  - className    : extra class names
 */
export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 50,
  duration = 0.7,
  threshold = 0.1,
  className = '',
  style = {},
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: threshold })

  const dirMap = {
    up:    { y: distance, x: 0 },
    down:  { y: -distance, x: 0 },
    left:  { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }

  const initial = { opacity: 0, ...dirMap[direction] }
  const animate = inView
    ? { opacity: 1, x: 0, y: 0 }
    : initial

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={initial}
      animate={animate}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // smooth easeOut cubic
      }}
    >
      {children}
    </motion.div>
  )
}
