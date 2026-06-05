import { useRef, useState, useCallback, useEffect } from 'react'
import {
  motion,
  useInView,
  useAnimation,
  useReducedMotion,
} from 'framer-motion'
import { MagicCursor } from '@/components/ui/magic-cursor'

// ─── Figma asset URLs ─────────────────────────────────────────────
const IMG_HAND_DESKTOP =
  'https://www.figma.com/api/mcp/asset/1efabadb-b523-4cb0-8256-24d1f7872733'
const IMG_HAND_MOBILE =
  'https://www.figma.com/api/mcp/asset/6f89bb14-caf3-421b-a755-56318f16a05e'
const IMG_DIVIDER =
  'https://www.figma.com/api/mcp/asset/d9e198f0-5d12-41d7-be96-c9283bdbb30c'
const IMG_DIVIDER_MOBILE =
  'https://www.figma.com/api/mcp/asset/35c8d666-74be-49c7-86c4-26e46050d1d6'
const IMG_ICON_DESKTOP =
  'https://www.figma.com/api/mcp/asset/d19f0af6-dc1f-4a50-8944-59e499066a9a'
const IMG_ICON_MOBILE =
  'https://www.figma.com/api/mcp/asset/471497a2-9436-4e04-9aa2-235de2531dd7'

// Blob masks
const MASK_LG_D = 'https://www.figma.com/api/mcp/asset/bb25ea57-6d0e-41e3-8ba6-fb1d169b2dcc'
const MASK_MD_D = 'https://www.figma.com/api/mcp/asset/6305f2fc-ac94-48b4-b998-da84e441ee29'
const MASK_SM_D = 'https://www.figma.com/api/mcp/asset/958d7953-b2f0-4f97-a075-de373dd69fc0'
const MASK_LG_M = 'https://www.figma.com/api/mcp/asset/dc439313-94c1-45e3-8003-039d62360380'
const MASK_MD_M = 'https://www.figma.com/api/mcp/asset/07565914-6a0b-4732-b98b-964322a95299'
const MASK_SM_M = 'https://www.figma.com/api/mcp/asset/6ef71bed-9c5d-439f-801c-767f1cd22596'

// ─── Types ────────────────────────────────────────────────────────
type MaskSize = 'lg' | 'md' | 'sm'

interface BlobConfig {
  id: string
  label: string
  bg: string
  text: string
  rotation: number
  leftD: string    // desktop left
  bottomD: string  // desktop bottom
  leftM: string    // mobile left
  bottomM: string  // mobile bottom
  mobileOnly?: boolean
  desktopOnly?: boolean
  mask: MaskSize
}

// Desktop mask dims
const MASK_D: Record<MaskSize, { w: number; h: number }> = {
  lg: { w: 214, h: 89 },
  md: { w: 184, h: 79 },
  sm: { w: 180, h: 75 },
}
// Mobile mask dims (~70% of desktop)
const MASK_M: Record<MaskSize, { w: number; h: number }> = {
  lg: { w: 159, h: 66 },
  md: { w: 128, h: 55 },
  sm: { w: 124, h: 52 },
}

// ─── Blob data ────────────────────────────────────────────────────
const BLOBS: BlobConfig[] = [
  {
    id: 'marketing', label: 'MARKETING', bg: '#37b669', text: '#fff',
    rotation: -12.66,
    leftD: '0%',    bottomD: '0px',
    leftM: '0px',   bottomM: '0px',
    mask: 'lg',
  },
  {
    id: 'strategy', label: 'STRATEGY', bg: '#f4ff77', text: '#161614',
    rotation: 0,
    leftD: '7%',    bottomD: '90px',
    leftM: '77px',  bottomM: '50px',
    mask: 'md',
  },
  {
    id: 'branding', label: 'BRANDING', bg: '#ed5d3a', text: '#fff',
    rotation: 9.95,
    leftD: '14%',   bottomD: '10px',
    leftM: '161px', bottomM: '0px',
    mask: 'sm',
  },
  {
    id: 'sales', label: 'SALES', bg: '#659df5', text: '#161614',
    rotation: 26.86,
    leftD: '21%',   bottomD: '80px',
    leftM: '197px', bottomM: '50px',
    mask: 'md',
  },
  {
    id: 'website-dev', label: 'WEBSITE DEV', bg: '#fccef0', text: '#161614',
    rotation: -22.07,
    leftD: '28%',   bottomD: '0px',
    leftM: '272px', bottomM: '0px',
    mask: 'md',
  },
  {
    id: 'framer-dev', label: 'FRAMER DEV', bg: '#fbf8e9', text: '#161614',
    rotation: 13.23,
    leftD: '38%',   bottomD: '0px',
    leftM: '0px',   bottomM: '0px',
    desktopOnly: true,
    mask: 'md',
  },
  {
    id: 'webflow', label: 'WEBFLOW', bg: '#6aea9c', text: '#161614',
    rotation: -19.31,
    leftD: '45%',   bottomD: '80px',
    leftM: '0px',   bottomM: '0px',
    desktopOnly: true,
    mask: 'md',
  },
  {
    id: 'newsletter', label: 'NEWSLETTER', bg: '#ed5d3a', text: '#fff',
    rotation: -16.7,
    leftD: '52%',   bottomD: '0px',
    leftM: '0px',   bottomM: '0px',
    desktopOnly: true,
    mask: 'sm',
  },
  {
    id: 'uiux-design', label: 'UIUX DESIGN', bg: '#659df5', text: '#fff',
    rotation: 9.95,
    leftD: '59%',   bottomD: '70px',
    leftM: '0px',   bottomM: '0px',
    desktopOnly: true,
    mask: 'sm',
  },
  {
    id: 'portfolio', label: 'PORTFOLIO', bg: '#f4ff77', text: '#161614',
    rotation: -45.63,
    leftD: '65%',   bottomD: '30px',
    leftM: '0px',   bottomM: '0px',
    desktopOnly: true,
    mask: 'md',
  },
  {
    id: 'ai-designs', label: 'AI DESIGNS', bg: '#fbf8e9', text: '#161614',
    rotation: 13.73,
    leftD: '72%',   bottomD: '0px',
    leftM: '0px',   bottomM: '0px',
    desktopOnly: true,
    mask: 'lg',
  },
  {
    id: 'illustration', label: 'ILLUSTRATION', bg: '#fe99b6', text: '#161614',
    rotation: 26.86,
    leftD: '79%',   bottomD: '75px',
    leftM: '0px',   bottomM: '0px',
    desktopOnly: true,
    mask: 'md',
  },
  {
    id: 'advertisement', label: 'ADVERTISEMENT', bg: '#659df5', text: '#161614',
    rotation: 6.99,
    leftD: '87%',   bottomD: '10px',
    leftM: '0px',   bottomM: '0px',
    desktopOnly: true,
    mask: 'md',
  },
]

// ─── Stable seeded random ─────────────────────────────────────────
function sr(seed: number, min: number, max: number) {
  const v = Math.sin(seed * 9301 + 49297) * 233280
  return min + ((v - Math.floor(v)) * (max - min))
}

// ─── useIsMobile ──────────────────────────────────────────────────
function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', handler)
    setMobile(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return mobile
}

// ─── BlobTag ──────────────────────────────────────────────────────
interface BlobTagProps {
  config: BlobConfig
  index: number
  isMobile: boolean
  isInView: boolean
  siblingRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  reducedMotion: boolean
}

function BlobTag({ config, index, isMobile, isInView, siblingRefs, reducedMotion }: BlobTagProps) {
  const [hovered, setHovered] = useState(false)
  const outerRef   = useRef<HTMLDivElement>(null)  // sibling reaction target (no Framer Motion)
  const blobRef    = useRef<HTMLDivElement>(null)  // magnetic detection target
  const mainCtrl   = useAnimation()
  const magCtrl    = useAnimation()
  const rafId      = useRef<number | null>(null)
  const hasEntered = useRef(false)
  const [maskReady, setMaskReady] = useState(false)

  const dims   = isMobile ? MASK_M[config.mask] : MASK_D[config.mask]
  const maskD  = config.mask === 'lg' ? MASK_LG_D : config.mask === 'sm' ? MASK_SM_D : MASK_MD_D
  const maskM  = config.mask === 'lg' ? MASK_LG_M : config.mask === 'sm' ? MASK_SM_M : MASK_MD_M
  const maskUrl = isMobile ? maskM : maskD

  const rot      = config.rotation
  const floatY   = sr(index * 3, -2.5, 2.5)
  const floatRot = sr(index * 7, -1, 1)
  const floatDur = sr(index * 11, 4, 8)
  const floatDly = sr(index * 5, 0, 3)

  // Preload mask so fill is visible from the first frame of the fall
  useEffect(() => {
    setMaskReady(false)
    hasEntered.current = false
    let cancelled = false
    const img = new Image()
    img.onload = () => { if (!cancelled) setMaskReady(true) }
    img.onerror = () => { if (!cancelled) setMaskReady(true) }
    img.src = maskUrl
    return () => { cancelled = true }
  }, [maskUrl])

  // Ambient float
  const startFloat = useCallback(() => {
    if (reducedMotion) return
    mainCtrl.start({
      y:      [0, floatY, 0, -floatY, 0],
      rotate: [rot, rot + floatRot, rot, rot - floatRot, rot],
      transition: { duration: floatDur, delay: floatDly, repeat: Infinity, ease: 'easeInOut' },
    })
  }, [mainCtrl, reducedMotion, floatY, floatRot, floatDur, floatDly, rot])

  // Entrance — fall in one by one on page load
  useEffect(() => {
    if (!isInView || !maskReady) return

    let cancelled = false
    const delay = index * 140
    const initRot = sr(index * 2, -18, 18)
    const fallY = -dims.h * 0.85

    const run = async () => {
      if (cancelled || hasEntered.current) return
      hasEntered.current = true

      if (reducedMotion) {
        await mainCtrl.start({ opacity: 1, rotate: rot, transition: { duration: 0.3 } })
        return
      }
      mainCtrl.set({ opacity: 0, y: fallY, scale: 0.94, rotate: initRot })
      await mainCtrl.start({
        opacity: 1, y: 0, scale: 1, rotate: rot,
        transition: { type: 'spring', stiffness: 260, damping: 16, mass: 0.7 },
      })
      if (!cancelled) startFloat()
    }

    const t = setTimeout(run, delay)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, maskReady])

  // Magnetic cursor (desktop only)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (reducedMotion || isMobile || !blobRef.current) return
    const rect = blobRef.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width  / 2)
    const dy = e.clientY - (rect.top  + rect.height / 2)
    const dist = Math.hypot(dx, dy)
    if (dist < 160) {
      const pull = (1 - dist / 160) * 7
      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() =>
        magCtrl.set({ x: (dx / dist) * pull, y: (dy / dist) * pull })
      )
    } else {
      magCtrl.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 250, damping: 30 } })
    }
  }, [reducedMotion, isMobile, magCtrl])

  useEffect(() => {
    if (isMobile) return
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [isMobile, handleMouseMove])

  // Hover
  const handleHoverStart = () => {
    if (reducedMotion) return
    setHovered(true)
    mainCtrl.stop()
    mainCtrl.start({
      scale:  1.05,
      rotate: [rot, rot - 6, rot + 5, rot - 3, rot + 1, rot],
      transition: {
        scale:  { type: 'spring', stiffness: 400, damping: 18 },
        rotate: { duration: 0.45, ease: 'easeInOut' },
      },
    })
    // Neighbor lift — applied to the outer wrapper div, not the Framer Motion div
    // Using CSS `translate` property (separate from `transform`) avoids conflicts
    siblingRefs.current.forEach((el, i) => {
      if (i === index || !el) return
      const gap = Math.abs(i - index)
      if (gap <= 3) {
        const lift = Math.max(0, 5 - gap * 1.2)
        const nudge = sr(i * 17, -2, 2)
        el.style.setProperty('--sibling-lift', `translateY(-${lift}px) rotate(${nudge}deg)`)
        el.style.transform = `translateY(-${lift}px) rotate(${nudge}deg)`
        el.style.transition = 'transform 0.3s cubic-bezier(0.22,1,0.36,1)'
      }
    })
  }

  const handleHoverEnd = () => {
    setHovered(false)
    mainCtrl.start({
      scale: 1, rotate: rot, y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 28 },
    }).then(startFloat)
    siblingRefs.current.forEach((el, i) => {
      if (i === index || !el) return
      el.style.transform  = ''
      el.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1)'
    })
  }

  // Click press
  const handleTap = () => {
    if (reducedMotion) return
    mainCtrl.start({
      scale: [1, 0.93, 1],
      transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
    })
  }

  const left   = isMobile ? config.leftM   : config.leftD
  const bottom = isMobile ? config.bottomM : config.bottomD

  return (
    // Outer plain div — receives sibling lift transform directly (no Framer Motion conflict)
    <div
      ref={(el) => { outerRef.current = el; siblingRefs.current[index] = el }}
      data-cursor-skip
      style={{
        position:   'absolute',
        left,
        bottom,
        width:      dims.w,
        height:     dims.h,
        cursor:     'pointer',
        userSelect: 'none',
      }}
    >
      {/* Magnetic x/y shift layer */}
      <motion.div style={{ width: '100%', height: '100%', willChange: 'transform' }} animate={magCtrl}>
      {/* Main animation: entrance + ambient + hover */}
      <motion.div
        ref={blobRef}
        style={{
          width:              '100%',
          height:             '100%',
          position:           'relative',
          willChange:         'transform',
          opacity:            0,
          backgroundColor:    config.bg,
          WebkitMaskImage:    maskReady ? `url("${maskUrl}")` : undefined,
          maskImage:          maskReady ? `url("${maskUrl}")` : undefined,
          WebkitMaskSize:     '100% 100%',
          maskSize:           '100% 100%',
          WebkitMaskRepeat:   'no-repeat',
          maskRepeat:         'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition:       'center',
        }}
        animate={mainCtrl}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        onTap={handleTap}
      >
        {/* Label */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 16px',
          }}
        >
          <span
            style={{
              fontFamily:    'Inter, sans-serif',
              fontSize:      isMobile ? 11 : 14,
              fontWeight:    400,
              color:         config.text,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace:    'nowrap',
              position:      'relative',
              display:       'inline-block',
            }}
          >
            {config.label}
            {/* Animated strikethrough */}
            <span
              aria-hidden
              style={{
                position:        'absolute',
                left:            0, right: 0,
                top:             '50%',
                height:          '1.2px',
                backgroundColor: config.text,
                transform:       'translateY(-50%)',
                opacity:         hovered ? 0 : 1,
                transition:      'opacity 0.25s ease',
                pointerEvents:   'none',
              }}
            />
          </span>
        </div>
      </motion.div>
      </motion.div>
    </div>
  )
}

// ─── NavLink ──────────────────────────────────────────────────────
function NavLink({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.a
      href="#"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ color: hovered ? '#ffffff' : '#8f8f8f' }}
      transition={{ duration: 0.18 }}
      style={{
        fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16,
        lineHeight: 1, textDecoration: 'none', display: 'block',
      }}
    >
      {label}
    </motion.a>
  )
}

function NavColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1 }}>
        {title}
      </span>
      {links.map((l) => <NavLink key={l} label={l} />)}
    </div>
  )
}

function Divider({ mobile }: { mobile: boolean }) {
  return (
    <div style={{ width: '100%', height: 1, position: 'relative', transform: 'rotate(0.23deg)', flexShrink: 0 }}>
      <img
        src={mobile ? IMG_DIVIDER_MOBILE : IMG_DIVIDER}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }}
      />
    </div>
  )
}

// ─── ApexFooter ───────────────────────────────────────────────────
export default function ApexFooter() {
  const reducedMotion = useReducedMotion() ?? false
  const isMobile      = useIsMobile(640)
  const footerRef      = useRef<HTMLDivElement>(null)
  const cardRef        = useRef<HTMLDivElement>(null)
  const blobSectionRef = useRef<HTMLDivElement>(null)
  const cursorLayerRef = useRef<HTMLDivElement>(null)
  const blobRefs       = useRef<(HTMLDivElement | null)[]>([])
  const handCtrl       = useAnimation()
  const isInView       = useInView(footerRef, { once: true, margin: '-8% 0px' })
  const blobsInView    = useInView(blobSectionRef, { once: true, margin: '0px 0px -10% 0px' })

  useEffect(() => {
    if (!isInView) return
    if (reducedMotion) {
      handCtrl.set({ rotate: 3.57, scale: 1, opacity: 1 })
      return
    }
    handCtrl.set({ rotate: 3.57, scale: 0.85, opacity: 0 })
    handCtrl.start({
      rotate: 3.57, scale: 1, opacity: 1,
      transition: { type: 'spring', stiffness: 280, damping: 22, delay: 0.15 },
    })
  }, [isInView, reducedMotion, handCtrl])

  const visibleBlobs = BLOBS.filter((b) =>
    isMobile ? !b.desktopOnly : !b.mobileOnly
  )

  const pad       = isMobile ? '50px 22px 0' : '90px 74px 0'
  const outerPad  = isMobile ? 8 : 14
  const blobH     = isMobile ? 180 : 280
  const bleed     = isMobile ? 22 : 74
  const fontSize  = isMobile ? 32 : 50
  const handW     = isMobile ? 60 : 72
  const handH     = isMobile ? 77 : 96
  const imgHand   = isMobile ? IMG_HAND_MOBILE : IMG_HAND_DESKTOP
  const imgIcon   = isMobile ? IMG_ICON_MOBILE  : IMG_ICON_DESKTOP

  return (
    <footer ref={footerRef} aria-label="Site footer" style={{ background: '#181818', padding: outerPad, width: '100%' }}>
      <div
        ref={cardRef}
        style={{
          background:    '#202020',
          borderRadius:  12,
          padding:       pad,
          position:      'relative',
          overflow:      'hidden',
          display:       'flex',
          flexDirection: 'column',
          gap:           isMobile ? 39 : 50,
        }}
      >
        <div
          ref={cursorLayerRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
        />
        <MagicCursor
          containerRef={cardRef}
          layerRef={cursorLayerRef}
          disabled={reducedMotion}
          colors={['244 255 119', '255 252 240', '101 157 245']}
          glowDuration={140}
          maximumGlowPointSpacing={7}
        />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: isMobile ? 39 : 50 }}>
        {/* ── Headline ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <h2
            style={{
              fontFamily: 'Phudu, serif',
              fontWeight: 600,
              fontSize:   fontSize,
              color:      '#fff',
              margin:     0,
              lineHeight: 1.15,
              width:      'fit-content',
            }}
          >
            Thank you for your curiosity.
            <br />
            Let's build something cool.
          </h2>
          <motion.div
            data-cursor-skip
            animate={handCtrl}
            onHoverStart={() => {
              if (reducedMotion) return
              handCtrl.start({
                rotate: [3.57, 14, -8, 11, -4, 3.57],
                scale: 1.12,
                y: -5,
                transition: {
                  rotate: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
                  scale:  { type: 'spring', stiffness: 420, damping: 16 },
                  y:      { type: 'spring', stiffness: 420, damping: 16 },
                },
              })
            }}
            onHoverEnd={() => {
              if (reducedMotion) return
              handCtrl.start({
                rotate: 3.57, scale: 1, y: 0,
                transition: { type: 'spring', stiffness: 300, damping: 22 },
              })
            }}
            style={{ flexShrink: 0, width: handW, height: handH, cursor: 'default' }}
          >
            <img src={imgHand} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
          </motion.div>
        </div>

        <Divider mobile={isMobile} />

        {/* ── Brand + Nav ──────────────────────────────────── */}
        <div
          style={{
            display:        'flex',
            flexDirection:  isMobile ? 'column' : 'row',
            alignItems:     'flex-start',
            justifyContent: 'space-between',
            gap:            isMobile ? 40 : 40,
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={imgIcon} alt="Apex icon" style={{ width: 34, height: 34 }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 400, color: '#fff', lineHeight: 1 }}>
                Apex<span style={{ color: '#8f8f8f' }}>™</span>
              </span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, color: '#8f8f8f', margin: 0, lineHeight: '20px', letterSpacing: '-0.096px' }}>
              Smarter tools for modern finance teams.
              <br />
              All rights reserved.
            </p>
          </div>

          {/* Nav */}
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
              <div style={{ display: 'flex', gap: 32 }}>
                <NavColumn title="Quick Links" links={['Home', 'About', 'Services', 'Contact']} />
                <NavColumn title="Products"    links={['Ai Assistant', 'Mobile App', 'Account', 'Credit Card']} />
              </div>
              <NavColumn title="Company" links={['About', 'Privacy Policy', 'Support', 'Terms of Service']} />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'clamp(40px, 8vw, 130px)', flexWrap: 'wrap' }}>
              <NavColumn title="Quick Links" links={['Home', 'About', 'Services', 'Contact']} />
              <NavColumn title="Products"    links={['Ai Assistant', 'Mobile App', 'Account', 'Credit Card']} />
              <NavColumn title="Company"     links={['About', 'Privacy Policy', 'Support', 'Terms of Service']} />
            </div>
          )}
        </div>

        <Divider mobile={isMobile} />

        {/* ── Blobs ────────────────────────────────────────── */}
        <div
          ref={blobSectionRef}
          style={{
            position:   'relative',
            width:      `calc(100% + ${bleed * 2}px)`,
            marginLeft: -bleed,
            height:     blobH,
            flexShrink: 0,
          }}
        >
          {visibleBlobs.map((blob, i) => (
            <BlobTag
              key={blob.id}
              config={blob}
              index={i}
              isMobile={isMobile}
              isInView={blobsInView}
              siblingRefs={blobRefs}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
        </div>
      </div>
    </footer>
  )
}
