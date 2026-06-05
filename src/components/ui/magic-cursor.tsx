import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Sparkle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Point {
  x: number
  y: number
}

interface MagicCursorProps {
  /** Bounds + coordinate space for the effect */
  containerRef: React.RefObject<HTMLElement | null>
  /** Layer element that receives glow/star nodes */
  layerRef: React.RefObject<HTMLDivElement | null>
  icon?: React.ReactNode
  starAnimationDuration?: number
  minimumTimeBetweenStars?: number
  minimumDistanceBetweenStars?: number
  glowDuration?: number
  maximumGlowPointSpacing?: number
  colors?: string[]
  sizes?: string[]
  className?: string
  disabled?: boolean
}

export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function selectRandom<T>(items: T[]): T {
  return items[rand(0, items.length - 1)]
}

export function calcDistance(a: Point, b: Point) {
  const diffX = b.x - a.x
  const diffY = b.y - a.y
  return Math.sqrt(diffX * diffX + diffY * diffY)
}

function clientToLocal(
  clientX: number,
  clientY: number,
  container: HTMLElement,
): Point {
  const rect = container.getBoundingClientRect()
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  }
}

function isInsideContainer(
  clientX: number,
  clientY: number,
  container: HTMLElement,
) {
  const rect = container.getBoundingClientRect()
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  )
}

const HOVER_ITEM_SELECTOR = 'a, button, [data-cursor-skip]'

function isOverHoverItem(clientX: number, clientY: number) {
  const el = document.elementFromPoint(clientX, clientY)
  return el?.closest(HOVER_ITEM_SELECTOR) != null
}

const MagicCursor = React.forwardRef<HTMLDivElement, MagicCursorProps>(
  (
    {
      containerRef,
      layerRef,
      icon: Icon = <Sparkle className="h-full w-full" />,
      starAnimationDuration = 1500,
      minimumTimeBetweenStars = 280,
      minimumDistanceBetweenStars = 80,
      glowDuration = 120,
      maximumGlowPointSpacing = 8,
      colors = ['244 255 119', '255 252 240', '255 255 255'],
      sizes = ['1.2rem', '0.85rem', '0.55rem'],
      className,
      disabled = false,
    },
    _ref,
  ) => {
    const configRef = React.useRef({
      starAnimationDuration,
      minimumTimeBetweenStars,
      minimumDistanceBetweenStars,
      glowDuration,
      maximumGlowPointSpacing,
      colors,
      sizes,
      animations: ['fall-1', 'fall-2', 'fall-3'],
    })

    const lastRef = React.useRef({
      starTimestamp: Date.now(),
      starPosition: { x: 0, y: 0 },
      mousePosition: { x: 0, y: 0 },
    })

    const countRef = React.useRef(0)
    const activeRef = React.useRef(false)
    const starRootsRef = React.useRef<Root[]>([])

    React.useEffect(() => {
      configRef.current = {
        starAnimationDuration,
        minimumTimeBetweenStars,
        minimumDistanceBetweenStars,
        glowDuration,
        maximumGlowPointSpacing,
        colors,
        sizes,
        animations: ['fall-1', 'fall-2', 'fall-3'],
      }
    }, [
      starAnimationDuration,
      minimumTimeBetweenStars,
      minimumDistanceBetweenStars,
      glowDuration,
      maximumGlowPointSpacing,
      colors,
      sizes,
    ])

    const createStar = React.useCallback(
      (position: Point) => {
        const layer = layerRef.current
        if (!layer) return

        const wrapper = document.createElement('div')
        const color = selectRandom(configRef.current.colors)
        const size = selectRandom(configRef.current.sizes)

        wrapper.className = cn('mouse-sparkles-star', className)
        wrapper.style.left = `${position.x}px`
        wrapper.style.top = `${position.y}px`
        wrapper.style.fontSize = size
        wrapper.style.color = `rgb(${color})`
        wrapper.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.45)`
        wrapper.style.animationName =
          configRef.current.animations[countRef.current++ % 3]
        wrapper.style.animationDuration = `${configRef.current.starAnimationDuration}ms`

        layer.appendChild(wrapper)

        const root = createRoot(wrapper)
        starRootsRef.current.push(root)
        root.render(Icon)

        window.setTimeout(() => {
          root.unmount()
          wrapper.remove()
          starRootsRef.current = starRootsRef.current.filter((r) => r !== root)
        }, configRef.current.starAnimationDuration)
      },
      [Icon, className, layerRef],
    )

    const createGlowPoint = React.useCallback(
      (position: Point) => {
        const layer = layerRef.current
        if (!layer) return

        const glow = document.createElement('div')
        glow.className = cn('mouse-sparkles-glow-point', className)
        glow.style.left = `${position.x}px`
        glow.style.top = `${position.y}px`

        layer.appendChild(glow)
        window.setTimeout(() => glow.remove(), configRef.current.glowDuration)
      },
      [className, layerRef],
    )

    const createGlow = React.useCallback(
      (last: Point, current: Point) => {
        const distance = calcDistance(last, current)
        const quantity = Math.max(
          Math.floor(distance / configRef.current.maximumGlowPointSpacing),
          1,
        )

        const dx = (current.x - last.x) / quantity
        const dy = (current.y - last.y) / quantity

        for (let index = 0; index < quantity; index++) {
          createGlowPoint({ x: last.x + dx * index, y: last.y + dy * index })
        }
      },
      [createGlowPoint],
    )

    const handleOnMove = React.useCallback(
      (clientX: number, clientY: number) => {
        const container = containerRef.current
        if (!container || disabled) return

        if (!isInsideContainer(clientX, clientY, container)) {
          if (activeRef.current) {
            lastRef.current.mousePosition = { x: 0, y: 0 }
            activeRef.current = false
          }
          return
        }

        const overHoverItem = isOverHoverItem(clientX, clientY)
        activeRef.current = true
        const mousePosition = clientToLocal(clientX, clientY, container)

        if (
          lastRef.current.mousePosition.x === 0 &&
          lastRef.current.mousePosition.y === 0
        ) {
          lastRef.current.mousePosition = mousePosition
        }

        if (!overHoverItem) {
          const now = Date.now()
          const hasMovedFarEnough =
            calcDistance(lastRef.current.starPosition, mousePosition) >=
            configRef.current.minimumDistanceBetweenStars
          const hasBeenLongEnough =
            now - lastRef.current.starTimestamp >
            configRef.current.minimumTimeBetweenStars

          if (hasMovedFarEnough || hasBeenLongEnough) {
            createStar(mousePosition)
            lastRef.current.starTimestamp = now
            lastRef.current.starPosition = mousePosition
          }

          createGlow(lastRef.current.mousePosition, mousePosition)
        }

        lastRef.current.mousePosition = mousePosition
      },
      [containerRef, createStar, createGlow, disabled],
    )

    const onMouseMove = React.useCallback(
      (e: MouseEvent) => handleOnMove(e.clientX, e.clientY),
      [handleOnMove],
    )

    const onTouchMove = React.useCallback(
      (e: TouchEvent) => {
        const touch = e.touches[0]
        if (touch) handleOnMove(touch.clientX, touch.clientY)
      },
      [handleOnMove],
    )

    const onMouseLeave = React.useCallback(() => {
      lastRef.current.mousePosition = { x: 0, y: 0 }
      activeRef.current = false
    }, [])

    React.useEffect(() => {
      if (disabled) return

      const container = containerRef.current
      if (!container) return

      container.addEventListener('mousemove', onMouseMove)
      container.addEventListener('touchmove', onTouchMove, { passive: true })
      container.addEventListener('mouseleave', onMouseLeave)

      return () => {
        container.removeEventListener('mousemove', onMouseMove)
        container.removeEventListener('touchmove', onTouchMove)
        container.removeEventListener('mouseleave', onMouseLeave)
        starRootsRef.current.forEach((root) => root.unmount())
        starRootsRef.current = []
        if (layerRef.current) layerRef.current.replaceChildren()
      }
    }, [containerRef, disabled, layerRef, onMouseMove, onTouchMove, onMouseLeave])

    return null
  },
)

MagicCursor.displayName = 'MagicCursor'

export { MagicCursor }
