// Inline SVG icons: identical on every phone (emoji are not), sized by font, and hidden from screen
// readers because each one sits next to a text label.

type IconProps = { className?: string }

function Svg({ className = 'size-6', children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

export const BoltIcon = (p: IconProps) => <Svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></Svg>
export const CameraIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></Svg>
)
export const SpeakerIcon = (p: IconProps) => (
  <Svg {...p}><path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></Svg>
)
export const StopIcon = (p: IconProps) => <Svg {...p}><rect x="6" y="6" width="12" height="12" rx="2" /></Svg>
export const ShieldIcon = (p: IconProps) => <Svg {...p}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" /><path d="m9 12 2 2 4-4" /></Svg>
export const AlertIcon = (p: IconProps) => <Svg {...p}><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17h.01" /></Svg>
export const CheckIcon = (p: IconProps) => <Svg {...p}><path d="m5 12 5 5 9-10" /></Svg>
export const ChevronIcon = (p: IconProps) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
export const ArrowUpIcon = (p: IconProps) => <Svg {...p}><path d="M12 19V5M5 12l7-7 7 7" /></Svg>
export const ArrowDownIcon = (p: IconProps) => <Svg {...p}><path d="M12 5v14M5 12l7 7 7-7" /></Svg>
export const MessageIcon = (p: IconProps) => <Svg {...p}><path d="M4 5h16v11H8l-4 4V5z" /></Svg>
export const CodeIcon = (p: IconProps) => <Svg {...p}><path d="m8 7-5 5 5 5M16 7l5 5-5 5" /></Svg>
export const ReceiptIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6M9 16h3" /></Svg>
)
export const ChartIcon = (p: IconProps) => <Svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Svg>
export const CalendarIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
export const SparkIcon = (p: IconProps) => <Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></Svg>
/** Points back in reading order: left in English; flipped by the caller with rtl:-scale-x-100 in Urdu. */
export const BackIcon = (p: IconProps) => <Svg {...p}><path d="m15 18-6-6 6-6" /></Svg>
export const ImageIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 17-5-5-9 8" /></Svg>
export const SunIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Svg>
)
export const CornersIcon = (p: IconProps) => <Svg {...p}><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></Svg>
export const FlatIcon = (p: IconProps) => <Svg {...p}><path d="M3 17 9 7h12l-6 10H3z" /></Svg>
export const TextSizeIcon = (p: IconProps) => <Svg {...p}><path d="M4 19 9 5l5 14M6 14h6M15 19l3.5-9 3.5 9M16.2 16h4.6" /></Svg>
