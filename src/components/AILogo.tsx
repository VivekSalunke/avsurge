type AILogoSize = 'xs' | 'sm' | 'md' | 'lg'

const BOX: Record<AILogoSize, string> = {
  xs: 'h-6 w-6 rounded-md',
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
}

const ICON: Record<AILogoSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4.5 w-4.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

export default function AILogo({ size = 'md', withLabel = false, className = '' }: {
  size?: AILogoSize
  withLabel?: boolean
  className?: string
}) {
  const mark = (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-neon-violet to-neon-cyan shadow-[0_4px_16px_rgba(139,92,246,0.35)] ${BOX[size]} ${className}`}>
      <svg className={ICON[size]} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"
          fill="white"
        />
      </svg>
    </span>
  )

  if (!withLabel) return mark

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.08)] p-1 pr-3.5 backdrop-blur-sm">
      {mark}
      <span className="bg-gradient-to-r from-neon-violet to-neon-cyan bg-clip-text text-sm font-extrabold tracking-tight text-transparent">
        AI
      </span>
    </span>
  )
}
